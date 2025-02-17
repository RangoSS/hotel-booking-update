import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const CheckoutForm = ({ bookingDetails, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State to hold the bank details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    branch: "",
    bankName: "",
  });

  // Handle input changes for bank details
  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    // Create a payment method using Stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Simulate payment processing (replace with actual API call as necessary)
    setTimeout(() => {
      // Pass both payment details and bank details to the onPaymentSuccess handler
      onPaymentSuccess({
        id: paymentMethod.id,
        amount: bookingDetails.totalPrice,
        status: "success",
        bankDetails: bankDetails, // Include the bank details
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

        {/* Bank Details Inputs */}
        <div className="bank-details">
          <label>
            Bank Name
            <input
              type="text"
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleBankInputChange}
              placeholder="e.g., Standard Bank, FNB"
              required
            />
          </label>
          <label>
            Branch
            <input
              type="text"
              name="branch"
              value={bankDetails.branch}
              onChange={handleBankInputChange}
              placeholder="e.g., Branch 101"
              required
            />
          </label>
          <label>
            Account Number
            <input
              type="text"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleBankInputChange}
              placeholder="e.g., 1234567890"
              required
            />
          </label>
        </div>

        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Processing..." : `Pay $${bookingDetails.totalPrice}`}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;
