import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const CheckoutForm = ({ bookingDetails, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    // Create a payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Simulate payment processing (Replace this with actual API call if needed)
    setTimeout(() => {
      onPaymentSuccess({
        id: paymentMethod.id,
        amount: bookingDetails.totalPrice,
        status: "success",
      });

      alert("Payment successful!");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="checkout-form">
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit}>
        <CardElement />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Processing..." : `Pay $${bookingDetails.totalPrice}`}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;
