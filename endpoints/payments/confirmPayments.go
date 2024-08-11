package payments

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
)

func ConfirmPayment(c *gin.Context) {

	response, _ := io.ReadAll(c.Request.Body)
	fmt.Printf("res := \n%v\n", string(response))

	c.Status(200)
}
