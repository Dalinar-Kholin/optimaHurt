package user

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
	"optimaHurt/hurtownie"
)

type SubTier int

const (
	base SubTier = iota
	premium
	canceled
)

type SignInBodyData struct {
	Email       string `json:"email"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	CompanyName string `json:"companyName"`
	Nip         string `json:"nip"`
	Street      string `json:"street"`
	Nr          string `json:"nr"`
}

type LoginBodyData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserMessage struct {
	UserId  primitive.ObjectID `bson:"userId"`
	Message string             `bson:"message"`
}

type User struct {
	Id         primitive.ObjectID
	Client     *http.Client
	Hurts      []hurtownie.IHurt
	Creds      []UserCreds
	ExpiryData primitive.DateTime `bson:"expiryData" bson:"expiryData"`
}

func (u *User) TakeHurtCreds(name hurtownie.HurtName) UserCreds {
	for _, i := range u.Creds {
		if i.HurtName == name {
			return i
		}
	}
	return UserCreds{}
}

type DataBaseUserObject struct {
	Id               primitive.ObjectID `bson:"_id" json:"_id"`
	Email            string             `bson:"email" json:"email"`
	Username         string             `bson:"username" json:"username"`
	Password         string             `bson:"password" json:"password"`
	CompanyData      CompanyData        `bson:"companyData" json:"companyData"`
	AvailableHurts   int                `bson:"availableHurts" json:"availableHurts"`
	Creds            []UserCreds        `bson:"creds" json:"creds"`
	ExpiryData       primitive.DateTime `bson:"expiryData" bson:"expiryData"`
	SubscriptionTier SubTier            `bson:"subscriptionTier" json:"subscriptionTier"`
}

type UserCreds struct {
	HurtName hurtownie.HurtName `json:"hurtName" bson:"hurtName"`
	Login    string             `json:"login" bson:"login"`
	Password string             `json:"password" bson:"password"`
}

type Adress struct {
	Street string `bson:"street"  bson:"street"`
	Nr     string `bson:"nr" json:"nr"`
}

type CompanyData struct {
	Name   string `bson:"CompanyName" json:"companyName"`
	Nip    string `bson:"nip" json:"nip"`
	Adress Adress `bson:"adress" json:"adress"`
}
