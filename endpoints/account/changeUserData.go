package account

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/goccy/go-json"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	. "optimaHurt/constAndVars"
	"optimaHurt/user"
)

type DataToInsert struct {
	NewHurtDataTab []user.UserCreds `json:"newHurtData"`
	NewCompanyData []interface{}    `json:"newCompanyData"`
	NewAccountData string           `json:"newAccountData"`
}

func handleHurtData(userInstance *user.DataBaseUserObject, data []user.UserCreds) {
	for _, i := range data {
		isIn := false
		fmt.Printf("i := %v", i)
		for j, x := range userInstance.Creds {
			if x.HurtName == i.HurtName {
				fmt.Printf("?")
				userInstance.Creds[j] = i
				isIn = true
			}
		}
		if !isIn {
			fmt.Printf("nioce")
			userInstance.Creds = append(userInstance.Creds, i)
		}
	}
}

func handleAccountData(userInstance *user.DataBaseUserObject, data string) {
	userInstance.Password = data
}
func handleCompanyData(userInstance *user.DataBaseUserObject, data []interface{}) {}

func ChangeUserData(c *gin.Context) {
	// zanim się połączymy z bazą sprawdzmy czy to ma sens
	var data DataToInsert
	reader := json.NewDecoder(c.Request.Body)
	err := reader.Decode(&data)
	if err != nil {
		c.JSON(400, gin.H{
			"error": "bad request",
		})
		return
	}

	auth := c.Request.Header.Get("Authorization") // w middlewear sprawdziliśmy i wiemy że jest poprawnie zdefiniowne
	userInstance := Users[auth]

	con := DbConnect.Collection(UserCollection)
	session, err := DbClient.StartSession() // rozpoczęci sesji aby potem zacząć transakcję
	if err != nil {
		c.JSON(501, gin.H{"error": "server stupido"})
		return
	}
	defer session.EndSession(ContextBackground)

	err = session.StartTransaction()
	if err != nil {
		c.JSON(501, gin.H{"error": "server stupido"})
		return
	}
	fmt.Printf("Id := %v\n", userInstance.Id)
	err = mongo.WithSession(ContextBackground, session, func(sc mongo.SessionContext) error {

		var dataBaseUser user.DataBaseUserObject
		err = con.FindOne(ContextBackground, bson.M{
			"_id": userInstance.Id,
		}).Decode(&dataBaseUser)
		if err != nil {
			return err
		}
		fmt.Printf("data := %v\n", data)
		if data.NewHurtDataTab != nil {
			handleHurtData(&dataBaseUser, data.NewHurtDataTab)
		}
		if data.NewAccountData != "" {
			handleAccountData(&dataBaseUser, data.NewAccountData)
		}
		if data.NewCompanyData != nil {
			handleCompanyData(&dataBaseUser, data.NewCompanyData)
		}

		var id user.DataBaseUserObject
		err = con.FindOneAndReplace(ContextBackground, bson.M{
			"_id": userInstance.Id,
		}, dataBaseUser).Decode(&id)
		if err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}
	if err := session.CommitTransaction(ContextBackground); err != nil {
		c.JSON(500, gin.H{
			"error": "cant finish Transaction",
		})
		return
	}
	c.Status(200)
	return
}
