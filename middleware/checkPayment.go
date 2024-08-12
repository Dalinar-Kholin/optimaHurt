package middleware

import (
	"github.com/gin-gonic/gin"
	. "optimaHurt/constAndVars"
	"time"
)

func CheckPayment(c *gin.Context) {

	token := c.Request.Header.Get("Authorization") // wiem że będzie bo jesteśmy już za innymi bramkami
	userInstance := Users[token]

	if time.Now().After(userInstance.ExpiryData.Time()) {
		c.JSON(401, gin.H{
			"error": "make Payment",
		})
		c.Abort()
	}
}
