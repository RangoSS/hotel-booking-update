import React, { useState, useContext } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase'; // Firebase config file
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../../context/AuthContext'; // Import context

const AddHotel = () => {
    const { currentUser } = useContext(AuthContext); // Access currentUser from context
    const [phone, setPhone] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [pricePerNight, setPricePerNight] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [numberOfRooms, setNumberOfRooms] = useState('');
    const [address, setAddress] = useState('');
    const [hotelType, setHotelType] = useState('beachfront');
    const [city, setCity] = useState('');
    const [ratings, setRatings] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (imageFiles.length + files.length > 50) {
            setError("You can upload a maximum of 50 images.");
            return;
        }
        setImageFiles([...imageFiles, ...files]);
        setImagePreviews([...imagePreviews, ...files.map(file => URL.createObjectURL(file))]);
        setError('');
    };

    const uploadImages = async () => {
        const uploadedImageUrls = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const storageRef = ref(storage, `hotelImages/${file.name}-${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            uploadedImageUrls.push(downloadURL);
        }
        return uploadedImageUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!currentUser) {
                setError('User not authenticated. Please log in again.');
                setLoading(false);
                return;
            }

            const uploadedImageUrls = await uploadImages();

            // Add hotel data, including userId (uid from currentUser)
            await addDoc(collection(db, 'hotels'), {
                userId: currentUser.uid, // Get userId from currentUser context
                phone,
                pricePerNight: Number(pricePerNight),
                pricePerDay: Number(pricePerDay),
                numberOfRooms: Number(numberOfRooms),
                address,
                hotelType,
                city,
                ratings: Number(ratings),
                imageUrls: uploadedImageUrls,
                createdAt: serverTimestamp(),
            });

            // Reset form fields
            setPhone('');
            setPricePerNight('');
            setPricePerDay('');
            setNumberOfRooms('');
            setAddress('');
            setHotelType('beachfront');
            setCity('');
            setRatings('');
            setImageFiles([]);
            setImagePreviews([]);
            setError('');
            document.querySelector('input[type="file"]').value = '';

        } catch (error) {
            console.error('Error adding hotel:', error);
            setError('Failed to register hotel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-hotel">
            <form className="mt-5" onSubmit={handleSubmit}>
                <h2>Add Hotel Information</h2>
                <a className="btn btn-primary" href='/hotel'>Back</a>
                {error && <p className="text-danger">{error}</p>}

                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                <div className="form-group">
                    <input type="number" className="form-control" placeholder="Price per night" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required />
                </div>

                <div className="form-group">
                    <input type="number" className="form-control" placeholder="Price per day" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
                </div>

                <div className="form-group">
                    <input type="number" className="form-control" placeholder="Number of Rooms Available" value={numberOfRooms} onChange={(e) => setNumberOfRooms(e.target.value)} required />
                </div>

                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>

                <div className="form-group">
                    <select className="form-control" value={hotelType} onChange={(e) => setHotelType(e.target.value)} required>
                        <option value="beachfront">Beachfront</option>
                        <option value="countryside">Countryside</option>
                        <option value="cabins">Cabins</option>
                        <option value="lakes">Lakes</option>
                        <option value="bed and breakfast">Bed and Breakfast</option>
                    </select>
                </div>

                <div className="form-group">
                    <input type="text" className="form-control" placeholder="City or Area" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>

                <div className="form-group">
                    <input type="number" className="form-control" placeholder="Ratings (1-5)" value={ratings} onChange={(e) => setRatings(e.target.value)} required />
                </div>

                <div className="form-group">
                    <p>Upload hotel images (Max 50)</p>
                    <input type="file" className="form-control" multiple onChange={handleImageUpload} />
                </div>

                <div className="image-preview-container">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview">
                            <img src={preview} alt={`Preview ${index}`} style={{ width: '100px', height: '100px', margin: '5px' }} />
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default AddHotel;
