package payments

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/paymentintent"
	"log"
)

type item struct {
	id     string
	Amount int64
}

func calculateOrderAmount(items []item) int64 {
	// Calculate the order total on the server to prevent
	// people from directly manipulating the amount on the client
	var total int64 = 0
	for _, item := range items {
		total += item.Amount
	}
	return total + 10000
}

func MakePayment(c *gin.Context) {

	var req struct {
		Items []item `json:"items"`
	}

	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		log.Printf("json.NewDecoder.Decode: %v", err)
		return
	}

	// Create a PaymentIntent with amount and currency
	var Cena int64 = 10000
	params := &stripe.PaymentIntentParams{
		Amount:   &Cena,
		Currency: stripe.String(string(stripe.CurrencyPLN)),
		// In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		fmt.Printf("błąd i chuj := %v", err)
		return
	}
	log.Printf("pi.New: %v", pi.ClientSecret)

	c.JSON(200, gin.H{
		"clientSecret": pi.ClientSecret,
	})
}
