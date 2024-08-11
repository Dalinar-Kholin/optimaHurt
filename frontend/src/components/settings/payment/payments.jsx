import {useEffect, useState} from 'react';
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import CheckoutForm from "./nwm.jsx";
const stripePromise = loadStripe("pk_test_51PmZWL03bfZgIVzMHNjyOTqAdtVPxS1E4neUDh79fSUyUl87UyiSN7TXtzax7y6AiWNGmrzuU7zAdIqdjLDypQ5300KU6kviFq");
import "./nice.css"
export default function Payments(){
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        fetch("/api/payment/stripe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ id: "xl-tshirt", Amount: 1 }] }),
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret));
    }, []);

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="App">
            {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm secret={clientSecret}/>
                </Elements>
            )}
        </div>
    );
}