package forgotPassword

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	. "optimaHurt/constAndVars"
)

func ResetPasswordFunc(c *gin.Context) {
	var requestBody struct {
		Password string `json:"password"`
		Token    string `json:"token"`
	}

	if err := json.NewDecoder(c.Request.Body).Decode(&requestBody); err != nil {
		c.JSON(400, gin.H{
			"message": "nie udało się sparsować odpowiedzi",
		})
		return
	}

	var forgot ForgotPasswordInDb
	if err := DbConnect.Collection(ResetPassword).FindOneAndDelete(ContextBackground, bson.M{
		"token": requestBody.Token,
	}).Decode(&forgot); err != nil {
		c.JSON(400, gin.H{"message": "bad token"})
		return
	}

	if err := DbConnect.Collection(UserCollection).FindOneAndUpdate(ContextBackground,
		bson.M{
			"_id": forgot.UserId},
		bson.M{"$set": bson.M{"password": requestBody.Password}}, nil).Err(); err != nil {
		fmt.Printf("%v", err)
		c.JSON(500, gin.H{
			"message": "nie udało się zaktualizować hasła",
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "udało się zaktualizować hasło",
	})
}
