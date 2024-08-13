package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v79"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/http"
	"optimaHurt/constAndVars"
	"optimaHurt/endpoints/account"
	"optimaHurt/endpoints/account/signIn"
	"optimaHurt/endpoints/orders"
	"optimaHurt/endpoints/payments"
	"optimaHurt/endpoints/takePrices"
	"optimaHurt/middleware"
	"os"
)

func connectToDB() *mongo.Client {
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(os.Getenv("CONNECTION_STRING")).SetServerAPIOptions(serverAPI)
	// Create a new client and connect to the serer
	client, err := mongo.Connect(constAndVars.ContextBackground, opts)
	if err != nil {
		panic(err)
	}
	constAndVars.DbConnect = client.Database(constAndVars.DbName)
	constAndVars.DbClient = client
	// Send a ping to confirm a successful connection
	if err := client.Database("admin").RunCommand(constAndVars.ContextBackground, bson.D{{"ping", 1}}).Err(); err != nil {
		panic(err)
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")
	return client
}

// potem automatycznie dołączam usera do requesta
func main() {

	connection := connectToDB()
	defer func() {
		connection.Disconnect(constAndVars.ContextBackground)
	}()
	stripe.Key = os.Getenv("STRIPE_KEY")
	r := gin.Default()
	r.Use(middleware.AddHeaders)
	accountEnd := account.AccountEndpoint{}
	order := orders.Order{}

	r.Static("/assets", "./frontend/dist/assets")

	// Obsługa głównego pliku index.html
	r.StaticFile("/", "./frontend/dist/index.html")

	// Obsługa aplikacji typu SPA - przekierowanie wszystkich nieznalezionych ścieżek do index.html
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	prices := takePrices.TakePrices{}
	// Dodanie trasy API
	api := r.Group("/api")
	{
		api.POST("/checkCredentials", accountEnd.CheckCredentials)

		api.POST("/checkCookie", func(c *gin.Context) {
			Response := func(c *gin.Context, response bool, status int) {
				c.JSON(status, gin.H{
					"response": response,
				})
			}
			token := c.Request.Header.Get("Authorization")
			fmt.Printf("token := %v\n", token)
			if token == "" {
				Response(c, false, http.StatusUnauthorized)
				return
			}
			fmt.Printf("cookie := %v\nmapa := %v\n", token, constAndVars.Users)
			_, ok := constAndVars.Users[token]
			if !ok {
				Response(c, false, http.StatusUnauthorized)
				return
			}
			Response(c, true, http.StatusOK) // ciasteczko jest prawidłowe
		})

		api.POST("/exit", func(c *gin.Context) {
			cookie, _ := c.Request.Cookie("accessToken")

			delete(constAndVars.Users, cookie.Value)
			fmt.Printf("deleted cookie %v\n", cookie.Value)
		})

		api.POST("/takePrices", middleware.CheckToken, middleware.CheckHurtTokenCurrency, middleware.CheckPayment, prices.TakeMultiple) // get nie może mieć body, więc robimy post
		api.GET("/takePrice", middleware.CheckToken, middleware.CheckHurtTokenCurrency, middleware.CheckPayment, prices.TakePrice)
		api.POST("/makeOrder", middleware.CheckToken, middleware.CheckHurtTokenCurrency, middleware.CheckPayment, order.MakeOrder)

		api.POST("/login", accountEnd.Login)
		api.POST("/signIn", signIn.SignIn)

		api.GET("/messages", middleware.CheckToken, account.CheckMessages)

		api.POST("/payment/stripe", middleware.CheckToken, payments.MakePayment)
		api.POST("/payment/stripe/webhook/confirm", payments.ConfirmPayment)

		api.PATCH("/changeUserData", middleware.CheckToken, account.ChangeUserData)

		api.GET("/addUser", account.AddUser)

	}

	//r.Run(":8080")
	r.Run("0.0.0.0:" + os.Getenv("PORT"))
	//r.RunTLS("0.0.0.0:"+"443", "./cert.crt", "./key.key")
	return
}

// raz na dzień będziemy aktualizować całe dane dotyczące liczby zapytań
