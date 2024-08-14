package payments

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/checkout/session"
	"github.com/stripe/stripe-go/v79/customer"
	"go.mongodb.org/mongo-driver/bson"
	. "optimaHurt/constAndVars"
	"optimaHurt/user"
)

const renewalSubscription = "prod_Qf7EpJeaA4tl6X"
const newSubscription = "prod_Qds2qOnyqRvsZx"

func MakePayment(c *gin.Context) {

	auth := c.Request.Header.Get("Authorization") // jesteśmy za bramką
	userInstance := Users[auth]

	conn := DbConnect.Collection(UserCollection)

	var userInDb user.DataBaseUserObject

	if err := conn.FindOne(ContextBackground, bson.M{"_id": userInstance.Id}).Decode(&userInDb); err != nil {
		c.JSON(500, gin.H{
			"message": "server error",
		})
	}

	customerParams := &stripe.CustomerParams{
		Email: stripe.String(userInDb.Email),
	}

	newCustomer, err := customer.New(customerParams)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "server error",
		})
		return
	}
	priceId := newSubscription
	if userInDb.AccountStatus != user.New {
		priceId = renewalSubscription
	}

	// Tworzenie sesji płatności Stripe
	params := &stripe.CheckoutSessionParams{
		Customer:           &newCustomer.ID,
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			&stripe.CheckoutSessionLineItemParams{
				Price:    stripe.String(priceId),
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
	info := user.StripeUserInfo{
		UserId:         userInDb.Id,
		SubscriptionId: s.Subscription.ID,
	}
	_, _ = DbConnect.Collection(StripeCollection).InsertOne(ContextBackground, info)

	// Zwrócenie ID sesji płatności
	c.JSON(200, gin.H{
		"id": s.ID,
	})
}
