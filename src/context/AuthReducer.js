const AuthReducer = (state, action) => {
    switch (action.type) {
      case "LOGIN": {
        // Update the state to set the current user when logging in
        return {
          currentUser: action.payload, // action.payload should contain user data
        };
      }
      case "LOGOUT": {
        // Clear the current user when logging out
        return {
          currentUser: null,
        };
      }
      default:
        // Return the current state if the action type is not recognized
        return state;
    }
  };
  
  export default AuthReducer;
  