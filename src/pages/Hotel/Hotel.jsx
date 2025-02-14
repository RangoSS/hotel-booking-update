import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebase'; // Firebase configuration
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import './hotelCards.scss'; // Import the custom CSS
import './hotel.scss'
import Sidebar from '../../components/sidebar/Sidebar';

const Hotel = () => {
    const [hotels, setHotels] = useState([]);
    const [editingHotelId, setEditingHotelId] = useState(null); // To track which hotel is being edited
    const [editData, setEditData] = useState({}); // Data for the hotel being edited
    const [newImage, setNewImage] = useState(null); // State to store new image file

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

    // Handle file input change for new image
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewImage(e.target.files[0]); // Store new image file
        }
    };

    // Update hotel data
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const hotelDocRef = doc(db, 'hotels', editingHotelId);

            // If there's a new image, upload it to Firebase Storage
            if (newImage) {
                const imageRef = ref(storage, `hotels/${newImage.name}`);
                await uploadBytes(imageRef, newImage);
                const imageUrl = await getDownloadURL(imageRef);

                // Update the imageUrls in the editData with the new image
                setEditData({ ...editData, imageUrls: [imageUrl] });
            }

            // Update hotel data in Firestore
            await updateDoc(hotelDocRef, editData);

            // Reset editing state
            setEditingHotelId(null);
            setEditData({});
            setNewImage(null); // Clear the image file input after update
            fetchHotels(); // Re-fetch hotels after update
        } catch (error) {
            console.error('Error updating hotel:', error);
        }
    };

    return (

        <div>
            <div className="con">

                <a href='/addHotel' className='button' >Add Hotel</a>
            </div>

            <div className="container">

                <div className="sidebar">
                    <Sidebar />
                </div>

                <div className="hotel-gallery">

                    {hotels.map((hotel) => (
                        <div key={hotel.id} className="card">
                            {editingHotelId === hotel.id ? (
                                // Display form for updating hotel details
                                <form onSubmit={handleUpdate}>
                                    <input
                                        type="text"
                                        placeholder="Address"
                                        value={editData.address || hotel.address}
                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={editData.city || hotel.city}
                                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Hotel Type"
                                        value={editData.hotelType || hotel.hotelType}
                                        onChange={(e) => setEditData({ ...editData, hotelType: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Phone"
                                        value={editData.phone || hotel.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Price per Day"
                                        value={editData.pricePerDay || hotel.pricePerDay}
                                        onChange={(e) => setEditData({ ...editData, pricePerDay: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Price per Night"
                                        value={editData.pricePerNight || hotel.pricePerNight}
                                        onChange={(e) => setEditData({ ...editData, pricePerNight: e.target.value })}
                                    />
                                    <input type="file" onChange={handleImageChange} /> {/* File input for new image */}
                                    <button type="submit">Update Hotel</button>
                                </form>
                            ) : (
                                // Display hotel details on a card
                                <>
                                    {hotel.imageUrls && hotel.imageUrls.length > 0 ? (
                                        <img src={hotel.imageUrls[0]} className="card-img-top" alt="Hotel" />
                                    ) : (
                                        <p>No image available</p> // Display message if no image
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{hotel.city}</h5>
                                        <p className="card-text"><strong>Address:</strong> {hotel.address}</p>
                                        <p className="card-text"><strong>Hotel Type:</strong> {hotel.hotelType}</p>
                                        <p className="card-text"><strong>Phone:</strong> {hotel.phone}</p>
                                        <p className="card-text"><strong>Price per Day:</strong> {hotel.pricePerDay}</p>
                                        <p className="card-text"><strong>Price per Night:</strong> {hotel.pricePerNight}</p>
                                        <button className="btn btn-primary" onClick={() => {
                                            setEditingHotelId(hotel.id);
                                            setEditData(hotel); // Prepopulate form with current hotel data
                                        }}>Update</button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(hotel.id, hotel.imageUrls)}>Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hotel;
