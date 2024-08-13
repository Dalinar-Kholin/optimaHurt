import {loadStripe} from "@stripe/stripe-js";
const stripePromise = loadStripe("pk_test_51PmZWL03bfZgIVzMHNjyOTqAdtVPxS1E4neUDh79fSUyUl87UyiSN7TXtzax7y6AiWNGmrzuU7zAdIqdjLDypQ5300KU6kviFq");
import {Button} from "@mui/material";
import fetchWithAuth from "../../typeScriptFunc/fetchWithAuth.ts";


const handleClick = async () => {
    // Pobranie instancji Stripe
    const stripe = await stripePromise;
    if (stripe==null){
        return
    }
    // Wywołanie backendu, aby utworzyć sesję
    const response = await fetchWithAuth('/api/payment/stripe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const session = await response.json();

    // Przekierowanie na stronę płatności Stripe
    if ("redirectToCheckout" in stripe) {
        const {error} = await stripe.redirectToCheckout({
            sessionId: session.id,
        });

        if (error) {
            console.error('Error redirecting to checkout:', error);
        }
    }

};

export default function PaymentComp(){

    return (
        <>
            <p> tutaj powinny być 2 opcje w zależności od tego jaki jest pakiet,
                ulepsz wersje, zakończ subskrypcję
            </p>
            <Button onClick={handleClick}>
                Go to Checkout
            </Button>
        </>
    );
}