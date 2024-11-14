package main

import (
	"github.com/stripe/stripe-go/v79"
	"gopkg.in/mail.v2"
	"optimaHurt/constAndVars"
	"optimaHurt/endpoints"
	"os"
)

/*func TestTedi() {
	tediInstance, _ := factory.HurtFactory(hurtownie.Tedi)
	tediObj := tediInstance.(*tedi.Tedi)
	proxyURL, err := url.Parse("http://127.0.0.1:8000")
	if err != nil {
		fmt.Println("Błąd parsowania URL proxy:", err)
		return
	}

	// Konfiguracja Transport z Proxy
	transport := &http.Transport{
		Proxy: http.ProxyURL(proxyURL),
	}

	client := &http.Client{
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	tediObj.TakeToken("lukasz@delikatesykredens.pl", "dqfciavfbvuzrdsx", client)
	token := tediObj.Token.AccessToken
	setHeader := func(req *http.Request) {
		req.Header.Add("Accept", "application/json")
		req.Header.Add("Accept-Language", "PL")
		req.Header.Add("Amper_app_name", "B2B")
		req.Header.Add("Origin", "https://tedi.kd-24.pl")
		req.Header.Add("Referer", "https://tedi.kd-24.pl")
		req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0")
		req.Header.Set("Accept-Language", "pl")
		req.Header.Set("Sec-Fetch-Dest", "empty")
		req.Header.Set("Sec-Fetch-Mode", "no-cors")
		req.Header.Set("Sec-Fetch-Site", "cross-site")
		req.Header.Set("AMPER_APP_NAME", "B2B")
		req.Header.Set("Pragma", "no-cache")
		req.Header.Set("Cache-Control", "no-cache")
		req.Header.Set("Authorization", "Bearer "+token)
	}

	requestBody := `
	   {
	               "id": 69774958,
	               "short_code": "COCA-BUL-LON-GIN-40-0.7/6-CO-P-S",
	               "cumulative_unit_ratio_splitter": "1.00",
	               "unit_roundup": true,
	               "status": "a",
	               "logistic_minimum": "0.00",
	               "vat": 23,
	               "ean": "0000000000000",
	               "is_visible": true,
	               "is_bestseller": false,
	               "is_published": true,
	               "name": "test item",
	               "short_description": "random item",
	               "default_unit_of_measure": "szt.",
	               "cumulative_unit_of_measure": "Op.zb.",
	               "final_price": 100.00,
	               "thumbnail": {
	                   "alt": "test item",
	                   "thumbnail": "https://d3ba12isw90j16.cloudfront.net/amper-tedi/product-images/512759/24935588-col-bulldog-07l-london-dry-gin-40-but-897076002010.jpg?format=webp&width=500",
	                   "type": "image"
	               },
	               "stocks": [],
	               "is_favourite": true,
	               "default_price": 100.00,
	               "percentage_discount": 0,
	               "final_price_gross": 80.48,
	               "manufacturer": null,
	               "is_for_sale": false,
	               "categories": null,
	               "attributes": [],
	               "cumulative_converter": 6.0,
	               "is_promotional_price": false,
	               "additional_cumulative_unit_of_measure": null,
	               "additional_cumulative_converter": null,
	               "omnibus_price": 0,
	               "is_availability_reminder_added": true,
	               "concession_is_valid": true,
	               "can_be_split": true,
	               "last_purchase": {
	                   "date": null,
	                   "quantity": null
	               },
	               "quantity_step": 1.0,
	               "product_images": [
	                   {
	                       "alt": "test item",
	                       "thumbnail": "https://d3ba12isw90j16.cloudfront.net/amper-tedi/product-images/512759/24935588-col-bulldog-07l-london-dry-gin-40-but-897076002010.jpg?format=webp&width=500",
	                       "type": "image"
	                   }
	               ],
	               "best_price": null
	           }`

	req, err := http.NewRequest("GET", "https://tedi-ws.ampli-solutions.com/product-list/?ids=69774958", bytes.NewBuffer([]byte(requestBody)))
	if err != nil {
		panic(err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	setHeader(req)

	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("body := %s\n", body)
}
*/

// potem automatycznie dołączam usera do requesta
func main() {
	// podzielić to na mikroserwisy
	connection := endpoints.ConnectToDB(os.Getenv("CONNECTION_STRING"))
	defer func() {
		connection.Disconnect(constAndVars.ContextBackground)
	}()

	constAndVars.EmailDialer = mail.NewDialer("smtp.gmail.com", 587, "optimahurtcorp@gmail.com", os.Getenv("EMAIL_PASSWORD"))

	stripe.Key = os.Getenv("STRIPE_KEY")
	r := endpoints.MakeRouter()

	r.Run("0.0.0.0:" + os.Getenv("PORT"))
	return
}
