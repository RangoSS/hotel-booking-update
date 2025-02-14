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

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const navigate = useNavigate();

  // Get the current user from local storage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("user");
    // Navigate to the login page
    navigate("/");
    // Optionally refresh the page
    window.location.reload();
  };

  const handleLogin = () => {
    // Navigate to the login page
    navigate("/login");
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
      </div>
    </div>
  );
};

export default Navbar;
