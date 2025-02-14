// LandingPage.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Navbar from '../../components/navbar/Navbar';
import './landing_page.scss';

const LandingPage = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numOfRooms, setNumOfRooms] = useState(1);
  const [username, setUsername] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceType, setPriceType] = useState('night'); // 'night' or 'day' for price selection

  const db = getFirestore();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user')); // Get user data from localStorage
  
  useEffect(() => {
    const fetchHotels = async () => {
      const hotelsCollection = collection(db, 'hotels');
      const hotelSnapshot = await getDocs(hotelsCollection);
      const hotelList = hotelSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHotels(hotelList);
    };
    fetchHotels();
  }, [db]);

  const calculateTotalPrice = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn && checkOut) {
      if (checkOut <= checkIn) {
        alert("Check-out date must be after check-in date.");
        return;
      }
      const timeDiff = checkOut - checkIn;
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (selectedHotel) {
        const price = priceType === 'night' ? selectedHotel.pricePerNight : selectedHotel.pricePerDay;
        setTotalPrice(price * dayDiff * numOfRooms);
      }
    }
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [checkInDate, checkOutDate, numOfRooms, priceType]);

  const handleBook = (hotel) => {
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setCheckInDate('');
    setCheckOutDate('');
    setNumOfRooms(1);
    setUsername('');
    setSurname('');
    setPhone('');
    setTotalPrice(0);
    setPriceType('night'); // Reset price type
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedHotel(null);
  };

  const handleBookingSubmit = async () => {
    if (!currentUser) {
      alert('You need to log in to book a hotel.');
      navigate('/login');
      return;
    }
  
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        alert('User details not found. Please update your profile.');
        return;
      }
  
      const userData = userSnap.data();
  
      const bookingData = {
        userId: currentUser.uid,
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        hotelId: selectedHotel.id,
        checkInDate,
        checkOutDate,
        numOfRooms,
        totalPrice,
        timestamp: new Date().toISOString(),  // Store the timestamp
      };
  
      // Save to localStorage
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
  
      // Optionally, you can also save it to Firestore
      //await setDoc(doc(db, 'bookings', `${currentUser.uid}_${selectedHotel.id}_${Date.now()}`), bookingData);
  
      alert('Successfully booked! You can add more.');
      handleCloseBookingModal();
    } catch (error) {
      console.error('Error booking hotel:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      <h1>Accommodation Listings</h1>
      <div className="hotel-cards-container">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <img src={hotel.imageUrls[0]} alt="Hotel" className="hotel-image" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div className="hotel-details">
              <h2>{hotel.name}</h2>
              <p><strong>Location:</strong> {hotel.address}, {hotel.city}</p>
              <p><strong>Price Per Night:</strong> ${hotel.pricePerNight || 'N/A'}</p>
              <p><strong>Price Per Day:</strong> ${hotel.pricePerDay || 'N/A'}</p>
              <p><strong>Type:</strong> {hotel.hotelType || 'N/A'}</p>
              <div className="button-container">
                <Button className="button primary" onClick={() => { setSelectedHotel(hotel); setShowDetailsModal(true); }}>
                  View Details
                </Button>
                <Button className="button primary" onClick={() => handleBook(hotel)}>
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={handleCloseBookingModal}>
        <Modal.Header closeButton>
          <Modal.Title>Book {selectedHotel?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="checkInDate">
              <Form.Label>Check-in Date</Form.Label>
              <Form.Control type="date" min={new Date().toISOString().split("T")[0]} value={checkInDate} onChange={(e) => { setCheckInDate(e.target.value); }} />
            </Form.Group>
            <Form.Group controlId="checkOutDate">
              <Form.Label>Check-out Date</Form.Label>
              <Form.Control type="date" min={new Date().toISOString().split("T")[0]} value={checkOutDate} onChange={(e) => { setCheckOutDate(e.target.value); }} />
            </Form.Group>
            <Form.Group controlId="numOfRooms">
              <Form.Label>Number of Rooms</Form.Label>
              <Form.Control type="number" min="1" value={numOfRooms} onChange={(e) => { setNumOfRooms(e.target.value); }} />
            </Form.Group>
            <Form.Group controlId="priceType">
              <Form.Label>Select Price</Form.Label>
              <Form.Control as="select" value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                <option value="night">Price Per Night</option>
                <option value="day">Price Per Day</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="surname">
              <Form.Label>Surname</Form.Label>
              <Form.Control type="text" value={surname} onChange={(e) => setSurname(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Form.Group>
            <h5>Total Price: ${totalPrice}</h5>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBookingModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleBookingSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for showing selected hotel details */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedHotel?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Details</h5>
          <p><strong>Location:</strong> {selectedHotel?.address}, {selectedHotel?.city}</p>
          <p><strong>Price Per Night:</strong> ${selectedHotel?.pricePerNight || 'N/A'}</p>
          <p><strong>Price Per Day:</strong> ${selectedHotel?.pricePerDay || 'N/A'}</p>
          <p><strong>Type:</strong> {selectedHotel?.hotelType || 'N/A'}</p>
          <p><strong>Phone:</strong> {selectedHotel?.phone || 'N/A'}</p>
          <p><strong>Description:</strong> {selectedHotel?.description || 'N/A'}</p>
          <p><strong>Rating:</strong> {selectedHotel?.rating || 'N/A'}</p>

          <h5>Gallery</h5>
          <div className="hotel-gallery">
            {selectedHotel?.imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Gallery ${index}`} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LandingPage;
