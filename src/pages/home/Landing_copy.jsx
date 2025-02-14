import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from 'react-bootstrap';
import { FacebookShareButton, WhatsappShareButton, FacebookIcon, WhatsappIcon } from 'react-share';
import Rating from 'react-rating-stars-component';
import './landing_page.scss';
import Navbar from "../../components/navbar/Navbar";

const LandingPage = () => {
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [numOfRooms, setNumOfRooms] = useState(1);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const db = getFirestore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            const hotelsCollection = collection(db, "hotels");
            const hotelSnapshot = await getDocs(hotelsCollection);
            const hotelList = hotelSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setHotels(hotelList);
        };

        fetchHotels();
    }, [db]);

    // Function to handle booking
    const handleBook = (hotel) => {
        setSelectedHotel(hotel);
        setShowBookingModal(true);
    };

    // Function to close the booking modal
    const handleCloseBookingModal = () => {
        setShowBookingModal(false);
        // Resetting form fields
        setCheckInDate('');
        setCheckOutDate('');
        setNumOfRooms(1);
        setName('');
        setSurname('');
        setPhone('');
        setTotalPrice(0);
    };

    // Function to close the hotel details modal
    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedHotel(null);
    };

    // Function to calculate the total price
    const calculateTotalPrice = () => {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (checkIn && checkOut) {
            const timeDiff = checkOut - checkIn; // difference in milliseconds
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); // convert to days
            if (selectedHotel) {
                const price = selectedHotel.pricePerNight || 0;
                setTotalPrice(price * dayDiff * numOfRooms);
            }
        }
    };

    // Function to handle booking submission
    const handleBookingSubmit = async () => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
            alert("You need to log in to book a hotel.");
            navigate("/login");
            return;
        }

        const bookingData = {
            userId: currentUserId,
            hotelId: selectedHotel.id,
            checkInDate,
            checkOutDate,
            numOfRooms,
            totalPrice,
            name,
            surname,
            phone,
        };

        // Save to Firestore
        await setDoc(doc(db, "bookings", `${currentUserId}_${selectedHotel.id}`), bookingData);
        alert("Successfully booked! You can add more.");
        handleCloseBookingModal(); // Close modal
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
                            <Form.Control type="date" value={checkInDate} onChange={(e) => { setCheckInDate(e.target.value); calculateTotalPrice(); }} />
                        </Form.Group>
                        <Form.Group controlId="checkOutDate">
                            <Form.Label>Check-out Date</Form.Label>
                            <Form.Control type="date" value={checkOutDate} onChange={(e) => { setCheckOutDate(e.target.value); calculateTotalPrice(); }} />
                        </Form.Group>
                        <Form.Group controlId="numOfRooms">
                            <Form.Label>Number of Rooms</Form.Label>
                            <Form.Control type="number" min="1" value={numOfRooms} onChange={(e) => { setNumOfRooms(e.target.value); calculateTotalPrice(); }} />
                        </Form.Group>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
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

                    <h5>Gallery</h5>
                    <div className="hotel-gallery">
                        {selectedHotel?.imageUrls.map((url, index) => (
                            <img key={index} src={url} alt={`Gallery ${index}`} style={{ width: '100%', height: '150px', objectFit: 'cover', margin: '5px' }} />
                        ))}
                    </div>

                    <div className="share-buttons">
                        <FacebookShareButton url={`http://your-website.com/hotels/${selectedHotel?.id}`} quote={selectedHotel?.name}>
                            <FacebookIcon size={32} round={true} />
                        </FacebookShareButton>
                        <WhatsappShareButton url={`http://your-website.com/hotels/${selectedHotel?.id}`} title={selectedHotel?.name}>
                            <WhatsappIcon size={32} round={true} />
                        </WhatsappShareButton>
                    </div>

                    <Rating
                        count={5}
                        onChange={(rating) => setUserRating(rating)}
                        size={24}
                        activeColor="#ffd700"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailsModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => handleBook(selectedHotel)}>
                        Book Now
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default LandingPage;
