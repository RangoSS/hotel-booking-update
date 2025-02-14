import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, storage } from '../../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState({}); // Empty object to hold form data
  const [perc, setPerc] = useState(null);

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name; // Generate unique filename
      const storageRef = ref(storage, name); // Storage reference
      const uploadTask = uploadBytesResumable(storageRef, file); // Start upload task

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPerc(progress); // Set upload progress
        },
        (error) => {
          console.log(error); // Log any errors during upload
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, img: downloadURL })); // Store image URL in data
          });
        }
      );
    };

    file && uploadFile(); // Trigger upload if file exists
  }, [file]);

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    setData({ ...data, [id]: value }); // Update form data
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // Create user in Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // Set user data in Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        ...data, // Include the form data
        Timestamp: serverTimestamp() // Add timestamp
      });

      // Reset form after successful submission
      setData({}); // Reset form data
      setFile(null); // Reset file to null
      setPerc(null); // Reset progress state to null
      alert("user has been added")
    } catch (err) {
      console.log(err); // Log any errors
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={file ? URL.createObjectURL(file) : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
              alt="Uploaded Preview"
            />
          </div>
          <div className="right">
            <form onSubmit={handleAdd}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => {
                if (input.type === "select") {
                  return (
                    <div className="formInput" key={input.id}>
                      <label htmlFor={input.id}>{input.label}</label>
                      <select id={input.id} onChange={handleInput} value={data[input.id] || ''}>
                        {input.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div className="formInput" key={input.id}>
                    <label>{input.label}</label>
                    <input
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      onChange={handleInput}
                      value={data[input.id] || ''} // Set value from data
                    />
                  </div>
                );
              })}

              <button disabled={perc !== null && perc < 100} type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
