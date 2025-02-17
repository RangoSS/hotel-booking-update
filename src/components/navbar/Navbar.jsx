import React, { useState, useEffect, useContext } from "react";
import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import BookOnlineIcon from "@mui/icons-material/BookOnline"; // Booking Icon
import { DarkModeContext } from "../../context/darkModeContext";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../CheckoutForm";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase"; // Firebase configuration
import Modal from "react-modal"; // Import modal library

// Modal Styles
const modalStyles = {
  content: {
    width: "50%",
    margin: "auto",
    padding: "20px",
    borderRadius: "10px",
    background: "#fff",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

Modal.setAppElement("#root"); // Ensure accessibility

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Stripe setup
    const stripe = loadStripe(process.env.STRIPE_PUBLIC_KEY); // Your public Stripe key
    setStripePromise(stripe);

    // Fetch the booking data from localStorage
    const storedBookingData = JSON.parse(localStorage.getItem("bookingData"));
    if (storedBookingData && storedBookingData.userId === currentUser?.uid) {
      setBookingData(storedBookingData);
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("bookingData");
    navigate("/login");
    window.location.reload();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDeleteBooking = () => {
    localStorage.removeItem("bookingData");
    setBookingData(null);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    if (currentUser && bookingData) {
      try {
        await setDoc(doc(db, 'bookings', `${currentUser.uid}_${bookingData.hotelId}_${Date.now()}`), {
          ...bookingData,
          paymentDetails: paymentDetails,
        });
        alert("Payment successful, booking info saved!");
        handleDeleteBooking();
      } catch (error) {
        console.error("Error saving payment info:", error);
        alert("There was an error processing your payment.");
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
            <DarkModeOutlinedIcon className="icon" onClick={() => dispatch({ type: "TOGGLE" })} />
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

          <div className="item" onClick={() => setModalIsOpen(true)}>
            <BookOnlineIcon className="icon" />
            {bookingData && <div className="counter">1</div>}
          </div>

          {/* Show username and logout if logged in */}
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
      </div>

      {/* Booking Modal */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={modalStyles}>
        <h2>Your Bookings</h2>
        {bookingData ? (
          <div className="cart-details">
            <p><strong>Hotel:</strong> {bookingData.hotelId}</p>
            <p><strong>Check-In:</strong> {new Date(bookingData.checkInDate).toLocaleDateString()}</p>
            <p><strong>Check-Out:</strong> {new Date(bookingData.checkOutDate).toLocaleDateString()}</p>
            <p><strong>Rooms:</strong> {bookingData.numOfRooms}</p>
            <p><strong>Total Price:</strong> ${bookingData.totalPrice}</p>
            <button onClick={handleDeleteBooking}>Delete</button>

            {/* Stripe Payment */}
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
        ) : (
          <p>No bookings found.</p>
        )}
        <button onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default Navbar;
