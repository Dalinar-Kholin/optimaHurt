package payments

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v79"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	. "optimaHurt/constAndVars"
	"optimaHurt/user"
	"time"
)

func ConfirmPayment(c *gin.Context) {
	var event stripe.Event
	if err := json.NewDecoder(c.Request.Body).Decode(&event); err != nil {
		c.Status(400)
		return
	}
	fmt.Printf("event body := %v\n", event)

	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			c.JSON(400, gin.H{
				"error": "bad body",
			})
			return
		}
		fmt.Printf("payment intend \n%v\n", paymentIntent)
		userMail := paymentIntent.ReceiptEmail
		conn := DbConnect.Collection(UserCollection)
		var userInDb user.DataBaseUserObject
		fmt.Printf("\n%v\n", userInDb)
		err = conn.FindOne(ContextBackground, bson.M{"email": userMail}).Decode(&userInDb)
		if err != nil {
			c.Status(400)
			return
		}
		var newTime time.Time
		if userInDb.ExpiryData.Time().After(time.Now()) {
			newTime = userInDb.ExpiryData.Time()
		} else {
			newTime = time.Now()
		}
		newTime.Add(30 * 24 * time.Hour)
		userInDb.ExpiryData = primitive.NewDateTimeFromTime(newTime)
		if err := conn.FindOneAndReplace(ContextBackground, bson.M{"email": userMail}, userInDb).Err(); err != nil {
			return
		}
		messageConn := DbConnect.Collection(UserMessageCollection)
		message := user.UserMessage{UserId: userInDb.Id, Message: "płatność się udała"}
		messageConn.InsertOne(ContextBackground, message)
		//dodanie wiadomości o udanej płatności
	}

	c.Status(200)
}
