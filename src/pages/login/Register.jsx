import React, { useState } from 'react';
import { auth, db, storage } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('user');  // Default role
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');  // For error handling
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // If there's an image, upload it
            let imageUrl = '';
            if (image) {
                const imageRef = ref(storage, `profileImages/${user.uid}`); //go to firebase and add rules for this user on storage
                await uploadBytes(imageRef, image);  // Upload profile image
                imageUrl = await getDownloadURL(imageRef);
            }

            // Save user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                username,
                displayName,
                phone,
                address,
                country,
                role,
                email,
                profileImageUrl: imageUrl,  // Save image URL
                createdAt: serverTimestamp(),
            });

            // Navigate to login page after successful registration
            navigate('/login');
        } catch (error) {
            console.error('Error registering user:', error);
            setError('Failed to register. Please try again.');  // Display friendly error message
        }
    };

    return (
        <div className="register">
            <form className="mt-5" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {error && <p className="text-danger">{error}</p>} {/* Display error if exists */}

                <div className="form-group">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <p className="ml-2">Upload Profile Image</p>
                    <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>

                <div className="form-group">
                    <label className="mr-2">Role:</label>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="roleAdmin"
                            value="admin"
                            checked={role === 'admin'}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="roleAdmin">Admin</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            id="roleUser"
                            value="user"
                            checked={role === 'user'}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="roleUser">User</label>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
