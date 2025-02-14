import { useContext, useState } from "react";
import "./login.scss";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);
  const db = getFirestore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Save user details in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: user.uid,
            name: userData.name,
            role: userData.role,
            email: user.email,
          })
        );

        // Dispatch user data to context
        dispatch({ type: "LOGIN", payload: { uid: user.uid, name: userData.name, email: user.email } });

        // Navigate based on role
        navigate(userData.role === "admin" ? "/home" : "/");
      } else {
        console.error("No user document found!");
        setError(true);
      }
    } catch (error) {
      console.error(error);
      setError(true);
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
        <p>Create account?</p>
        <a href="/register">Register Here</a>
        {error && <span>Wrong email or password!</span>}
      </form>
    </div>
  );
};

export default Login;
