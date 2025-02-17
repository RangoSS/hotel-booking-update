import React, { useState, useEffect } from "react";
import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../CheckoutForm"; // Assume this is the component that handles Stripe payment
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase"; // Assuming firebase.js is configured

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  // Get the current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const stripe = loadStripe(process.env.STRIPE_PUBLIC_KEY); // Your public Stripe key
    setStripePromise(stripe);

    // Fetch booking data from localStorage
    const storedBookingData = JSON.parse(localStorage.getItem("bookingData"));
    if (storedBookingData && storedBookingData.userId === currentUser?.uid) {
      setBookingData(storedBookingData);
    }
  }, [currentUser]);

  const handleLogout = () => {
    // Clear user data and booking data from local storage
    localStorage.removeItem("user");
    localStorage.removeItem("bookingData");
    navigate("/login");
    window.location.reload();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDeleteBooking = () => {
    // Delete booking data from localStorage and update the state
    localStorage.removeItem("bookingData");
    setBookingData(null);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    // Assuming paymentDetails contain successful payment information
    if (currentUser && bookingData) {
      try {
        await setDoc(doc(db, 'bookings', `${currentUser.uid}_${bookingData.hotelId}_${Date.now()}`), {
          ...bookingData,
          paymentDetails: paymentDetails,
        });
        alert('Payment successful, booking info saved!');
        // Optionally, clear the booking data after successful payment
        handleDeleteBooking();
      } catch (error) {
        console.error("Error saving payment info:", error);
        alert('There was an error processing your payment.');
      }
    }
  };

  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="search">
          <input type="text" placeholder="Search..." />
          <SearchOutlinedIcon />
        </div>

        <div className="items">
          <div className="item">
            <LanguageOutlinedIcon className="icon" />
            English
          </div>
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>
          <div className="item">
            <FullscreenExitOutlinedIcon className="icon" />
          </div>
          <div className="item">
            <NotificationsNoneOutlinedIcon className="icon" />
            <div className="counter">1</div>
          </div>
          <div className="item">
            <ChatBubbleOutlineOutlinedIcon className="icon" />
            <div className="counter">2</div>
          </div>
          <div className="item">
            <ListOutlinedIcon className="icon" />
          </div>

          {/* Display login button if no user is logged in */}
          {currentUser ? (
            <div className="item logme">
              <span className="username">{currentUser.username}</span>
              <button onClick={handleLogout} className="logout-button">
                Log Out
              </button>
            </div>
          ) : (
            <div className="item logme">
              <button onClick={handleLogin} className="login-button">
                Log In
              </button>
            </div>
          )}
        </div>

        {/* Display cart if bookingData exists */}
        {bookingData && (
          <div className="cart">
            <h3>Booking Details</h3>
            <div className="cart-details">
              <p>Hotel ID: {bookingData.hotelId}</p>
              <p>Check-In Date: {new Date(bookingData.checkInDate).toLocaleDateString()}</p>
              <p>Check-Out Date: {new Date(bookingData.checkOutDate).toLocaleDateString()}</p>
              <p>Rooms: {bookingData.numOfRooms}</p>
              <p>Total Price: ${bookingData.totalPrice}</p>
              <button onClick={handleDeleteBooking}>Delete Booking</button>
            </div>

            {/* Payment Section using Stripe */}
            <div className="payment-section">
              {stripePromise && (
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    bookingDetails={bookingData} 
                    onPaymentSuccess={handlePaymentSuccess} // Pass the success handler
                  />
                </Elements>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
