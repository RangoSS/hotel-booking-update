import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = () => {
  const [data, setData] = useState([]); // State to hold user data

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      let list = []; // Initialize list to hold fetched data
      try {
        const querySnapshot = await getDocs(collection(db, "users"));

        querySnapshot.forEach((doc) => {
          const userData = doc.data().data; // Extract the nested data object
          console.log("Document Data:", userData); // Log the actual user data

          // Push the flattened data into the list, ensure to handle undefined cases
          list.push({
            id: doc.id, // Document ID
            displayName: userData?.displayName || "N/A",
            username: userData?.username || "N/A",
            email: userData?.email || "N/A",
            phone: userData?.phone || "N/A",
            address: userData?.address || "N/A",
            country: userData?.country || "N/A",
            img: userData?.img || "", // Default empty if no image
          });
        });

        setData(list); // Set the fetched data in the state
        console.log("Flattened Data:", list); // Log flattened data
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    fetchData(); // Call the function
  }, []);


  // Handle deletion of a user
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id)); // Delete user from Firestore
      setData(data.filter((item) => item.id !== id)); // Update local state after deletion
    } catch (err) {
      console.log("Error deleting user:", err); // Log errors if any
    }
  };

  // Action column for view and delete functionality
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/users/${params.row.id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div className="deleteButton" onClick={() => handleDelete(params.row.id)}>
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Add New User
        <Link to="/users/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={[
          { field: "displayName", headerName: "Name", width: 200 },
          { field: "email", headerName: "Email", width: 250 },
          { field: "phone", headerName: "Phone", width: 150 },
          { field: "address", headerName: "Address", width: 200 },
          { field: "country", headerName: "Country", width: 150 },
          { field: "username", headerName: "Username", width: 150 },
          {
            field: "img", headerName: "Profile Picture", width: 100, renderCell: (params) => (
              <img src={params.value} alt="Profile" style={{ width: 50, height: 50, borderRadius: "50%" }} />
            )
          },
          ...actionColumn,
        ]}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
    </div>
  );
};

export default Datatable;
