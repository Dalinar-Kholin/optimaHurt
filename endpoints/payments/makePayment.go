package payments

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/checkout/session"
	. "optimaHurt/constAndVars"
)

func MakePayment(c *gin.Context) {

	var amount int64 = 20000 // Na potrzeby przykładu, kwota w centach (50.00 USD)

	auth := c.Request.Header.Get("Authorization") // jesteśmy za bramką

	// Tworzenie sesji płatności Stripe
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("pln"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:        stripe.String("bazowa subskrypcja"),
						Description: stripe.String("kinda nice"),
					},
					Recurring: &stripe.CheckoutSessionLineItemPriceDataRecurringParams{
						Interval: stripe.String("month"),
					},
					UnitAmount: &amount,
				},
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String("subscription"),
		SuccessURL: stripe.String("https://optimahurt-hayvfpjoza-lm.a.run.app/login"),
		CancelURL:  stripe.String("https://optimahurt-hayvfpjoza-lm.a.run.app/failed"),
		Metadata: map[string]string{
			"userId": Users[auth].Id.Hex(), // Przekazanie identyfikatora użytkownika
		},
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			TrialPeriodDays: stripe.Int64(14), // 14-dniowy okres próbny
		},
	}

	s, err := session.New(params)
	if err != nil {
		fmt.Printf("error %v", err)
		return
	}
	// Zwrócenie ID sesji płatności
	c.JSON(200, gin.H{
		"id": s.ID,
	})
}
