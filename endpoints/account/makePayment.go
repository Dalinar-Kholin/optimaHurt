package account

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
)

func MakePayment(c *gin.Context) {

	bdy, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.Status(500)
		fmt.Printf("cat read body")
		return
	}
	fmt.Printf("ciałko := \n%v\n", string(bdy))

}
