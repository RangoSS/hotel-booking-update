import React, { useEffect, useState, useContext } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebase'; // Firebase configuration
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import './hotelCards.scss'; // Import the custom CSS
import './hotel.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import { AuthContext } from '../../context/AuthContext'; // Import context

const Hotel = () => {
  const [hotels, setHotels] = useState([]);
  const [editingHotelId, setEditingHotelId] = useState(null); // To track which hotel is being edited
  const [editData, setEditData] = useState({}); // Data for the hotel being edited
  const [newImages, setNewImages] = useState([]); // State to store new image files
  const [showModal, setShowModal] = useState(false); // To manage modal visibility
  const [selectedHotel, setSelectedHotel] = useState(null); // Store the selected hotel for modal
  const { currentUser } = useContext(AuthContext); // Access currentUser from context

  // Fetch hotel data from Firestore
  const fetchHotels = async () => {
    const querySnapshot = await getDocs(collection(db, 'hotels'));
    const hotelList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHotels(hotelList);
  };

  useEffect(() => {
    fetchHotels(); // Fetch hotels on component mount
  }, []);

  // Delete hotel
  const handleDelete = async (hotelId, imageUrls) => {
    try {
      // Delete associated images from Firebase Storage
      if (imageUrls && imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef); // Delete image from storage
        }
      }

      // Delete hotel from Firestore
      await deleteDoc(doc(db, 'hotels', hotelId));

      // Update state after deletion
      setHotels(hotels.filter(hotel => hotel.id !== hotelId));
    } catch (error) {
      console.error('Error deleting hotel:', error);
    }
  };

  // Handle file input change for new images
  const handleImageChange = (e) => {
    if (e.target.files) {
      setNewImages([...e.target.files]); // Store new image files
    }
  };

  // Update hotel data
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const hotelDocRef = doc(db, 'hotels', editingHotelId);

      // If there are new images, upload them to Firebase Storage
      let updatedImageUrls = [];
      if (newImages.length > 0) {
        for (const newImage of newImages) {
          const imageRef = ref(storage, `hotels/${newImage.name}`);
          await uploadBytes(imageRef, newImage);
          const imageUrl = await getDownloadURL(imageRef);
          updatedImageUrls.push(imageUrl);
        }
        setEditData({ ...editData, imageUrls: updatedImageUrls });
      }

      // Update hotel data in Firestore
      await updateDoc(hotelDocRef, editData);

      // Reset editing state
      setEditingHotelId(null);
      setEditData({});
      setNewImages([]); // Clear the image file input after update
      fetchHotels(); // Re-fetch hotels after update
    } catch (error) {
      console.error('Error updating hotel:', error);
    }
  };

  // Filter hotels to only show those posted by the current user
  const userHotels = hotels.filter(hotel => hotel.userId === currentUser?.id); // Filter by userId

  // Function to open the modal and set the selected hotel
  const handleViewMore = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true); // Show the modal
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHotel(null);
    setEditingHotelId(null);
    setEditData({}); // Reset the edit form
  };

  return (
    <div>
      <div className="con">
        <a href='/addHotel' className='button'>Add Hotel</a>
      </div>

      <div className="container">
        <div className="sidebar">
          <Sidebar />
        </div>

        <div className="hotel-gallery">
          {userHotels.map((hotel) => (
            <div key={hotel.id} className="card">
              {hotel.imageUrls && hotel.imageUrls.length > 0 ? (
                <img
                  src={hotel.imageUrls[0]} // Show only the first image
                  className="card-img-top"
                  alt="Hotel"
                />
              ) : (
                <p>No image available</p> // Display message if no image
              )}
              <div className="card-body">
                <h5 className="card-title">{hotel.city}</h5>
                <p className="card-text"><strong>Address:</strong> {hotel.address}</p>
                <p className="card-text"><strong>Hotel Type:</strong> {hotel.hotelType}</p>
                <p className="card-text"><strong>Phone:</strong> {hotel.phone}</p>
                <p className="card-text"><strong>Number of Rooms:</strong> {hotel.numberOfRooms}</p>
                <p className="card-text"><strong>Price per Day:</strong> {hotel.pricePerDay}</p>
                <p className="card-text"><strong>Price per Night:</strong> {hotel.pricePerNight}</p>
                <p className="card-text"><strong>Ratings:</strong> {hotel.ratings}</p>
                <button className="btn btn-primary" onClick={() => {
                  setEditingHotelId(hotel.id);
                  setEditData(hotel); // Prepopulate form with current hotel data
                  setShowModal(true); // Show modal for editing
                }}>Update</button>
                <button className="btn btn-danger" onClick={() => handleDelete(hotel.id, hotel.imageUrls)}>Delete</button>
                <button className="btn btn-secondary" onClick={() => handleViewMore(hotel)}>View More Images</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for showing more images */}
      <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }} aria-hidden={!showModal}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">More Images</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              {selectedHotel && selectedHotel.imageUrls && selectedHotel.imageUrls.length > 1 ? (
                selectedHotel.imageUrls.map((url, index) => (
                  <img key={index} src={url} className="modal-img img-fluid" alt={`Hotel image ${index + 1}`} />
                ))
              ) : (
                <p>No additional images available</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Editing Hotel */}
      <div className={`modal ${showModal && editingHotelId ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal && editingHotelId ? 'block' : 'none' }} aria-hidden={!showModal}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Hotel</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.city}
                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Hotel Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.hotelType}
                    onChange={(e) => setEditData({ ...editData, hotelType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Rooms</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editData.numberOfRooms}
                    onChange={(e) => setEditData({ ...editData, numberOfRooms: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Price per Day</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editData.pricePerDay}
                    onChange={(e) => setEditData({ ...editData, pricePerDay: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Price per Night</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editData.pricePerNight}
                    onChange={(e) => setEditData({ ...editData, pricePerNight: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ratings</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editData.ratings}
                    onChange={(e) => setEditData({ ...editData, ratings: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Upload New Images</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    onChange={handleImageChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Update Hotel</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotel;
