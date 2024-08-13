package signIn

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	. "optimaHurt/constAndVars"
	"optimaHurt/user"
)

// tworzy usera w bazie, pozwala na
func SignIn(c *gin.Context) {

	var reqData user.SignInBodyData
	if err := json.NewDecoder(c.Request.Body).Decode(&reqData); err != nil {
		c.JSON(400, gin.H{
			"error": "bad data",
		})
		return
	}
	connection := DbConnect.Collection(UserCollection)
	var userInDb user.DataBaseUserObject
	if connection.FindOne(ContextBackground, bson.M{
		"$or": []bson.M{
			{"nip": reqData.Nip},
			{"username": reqData.Username},
			{"email": reqData.Email}, // email używany jest do rozliczania więc całkiem ważne
		},
	}).Decode(&userInDb) == nil {
		if userInDb.Username == reqData.Username {
			c.JSON(400, gin.H{
				"error": "username already exists",
			})
			return
		} else {
			fmt.Printf("user in Db := %v", userInDb)
			c.JSON(400, gin.H{
				"error": "company with this NIP already exists",
			})
			return
		}
	}

	newUser := user.DataBaseUserObject{
		Id:       primitive.NewObjectID(),
		Email:    reqData.Email,
		Username: reqData.Username,
		Password: reqData.Password,
		CompanyData: user.CompanyData{
			Name: reqData.CompanyName,
			Nip:  reqData.Nip,
			Adress: user.Adress{
				Street: reqData.Street,
				Nr:     reqData.Nr,
			},
		},
	}

	if _, err := connection.InsertOne(ContextBackground, newUser); err != nil {
		c.JSON(500, gin.H{
			"error": "cant add user",
		})
		return
	}
	message := user.UserMessage{UserId: userInDb.Id, Message: "aby odblokować możliwość sprawdzania przejdź do płatności i rozpocznij okres próbny"}

	_, _ = DbConnect.Collection(UserMessageCollection).InsertOne(ContextBackground, message)

	c.JSON(200, gin.H{
		"result": "user added",
	})

}
