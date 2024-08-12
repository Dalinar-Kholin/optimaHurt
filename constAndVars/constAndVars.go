package constAndVars

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"optimaHurt/user"
)

const (
	DbName                = "optiHurt"
	UserCollection        = "users"
	UserMessageCollection = "UserMessage"
)

var (
	Users             map[string]*user.User = make(map[string]*user.User) // mapuje id na usera -- zakładam że userów nie będzie jakoś strasznie dużo
	ContextBackground context.Context       = context.TODO()
	DbConnect         *mongo.Database
	DbClient          *mongo.Client
)

func ExportedFunction() {
	// Możesz tu umieścić jakikolwiek kod, nawet zostawić funkcję pustą
}
