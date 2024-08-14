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
)

func ConfirmPayment(c *gin.Context) {
	var event stripe.Event
	if err := json.NewDecoder(c.Request.Body).Decode(&event); err != nil {
		c.Status(400)
		return
	}
	fmt.Printf("event body := %v\n", event)

	switch event.Type {
	case "customer.subscription.deleted": // kiedy to się dzieje anulujemy użytkownikowi usługę
		var delInfo stripe.Subscription

		if err := json.Unmarshal(event.Data.Raw, &delInfo); err != nil {
			c.JSON(400, gin.H{
				"message": err.Error(),
			})
			return
		}
		var stripeInfo user.StripeUserInfo
		if err := DbConnect.Collection(StripeCollection).FindOneAndDelete(ContextBackground, bson.M{
			"subscriptionId": delInfo.ID,
		}).Decode(&stripeInfo); err != nil {
			c.JSON(400, gin.H{
				"message": err.Error(),
			})
			return
		}
		if err := DbConnect.
			Collection(UserCollection).
			FindOneAndUpdate(ContextBackground,
				bson.M{"_id": stripeInfo.UserId},
				bson.M{"$set": bson.M{"accountStatus": user.Inactive}}); err != nil {
			c.JSON(500, gin.H{
				"message": err.Err(),
			})
			return
		}
		c.JSON(200, gin.H{
			"message": "all is GIT",
		})
	case "checkout.session.completed":
		var session stripe.CheckoutSessionParams
		err := json.Unmarshal(event.Data.Raw, &session)
		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}
		fmt.Printf("session := %v\n", session)
		idString := session.Metadata["userId"]
		fmt.Printf("cleaned string :=%v\n", idString)
		id, err := primitive.ObjectIDFromHex(idString)
		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}
		conn := DbConnect.Collection(UserCollection)
		var userInDb user.DataBaseUserObject

		if _, err = conn.UpdateOne(ContextBackground, bson.M{"_id": id}, bson.M{"$set": bson.M{"accountStatus": user.Active}}); err != nil {
			c.JSON(400, gin.H{
				"error": err,
			})
			return
		}
		subscriptionID := event.Data.Object["subscription"].(string)
		info := user.StripeUserInfo{
			UserId:         userInDb.Id,
			SubscriptionId: subscriptionID,
		}
		_, err = DbConnect.Collection(StripeCollection).InsertOne(ContextBackground, info)
		fmt.Printf("%v", err)
		messageConn := DbConnect.Collection(UserMessageCollection)
		message := user.UserMessage{UserId: userInDb.Id, Message: "płatność się udała"}
		messageConn.InsertOne(ContextBackground, message)
	}
}
