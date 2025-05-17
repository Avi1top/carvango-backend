import React, { useEffect, useState } from "react";
import axios from "axios";
import classes from "./EditProfile.module.css";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    city: "",
    street_name: "",
    phone_number: "",
    password: "",
  });

  const [retypePassword, setRetypePassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  // Regular expressions for validation
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

  // Fetch the user's email data from the server
  useEffect(() => {
    const fetchProfileEmail = async () => {
      try {
        const response = await axios.get("/logIn/profile"); // Adjust the endpoint as necessary
        setEmail(response.data);
        console.log("email", response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfileEmail(); // Call the function to fetch data
  }, []);

  useEffect(() => {
   const fillProfileDetails = async () => {
     try {
       const response = await axios.post(`/editProfile/profileDetails`, 
         email,
       );
       console.log(response.data);
       setProfileData({
         first_name: response.data.first_name || "",
         last_name: response.data.last_name || "",
         city: response.data.city || "",
         street_name: response.data.street_name || "",
         phone_number: response.data.phone_number || "",
       });
     } catch (error) {
       console.error(error);
     }
   };

    fillProfileDetails();
  }, [email]);

  // Validate if the password meets the required pattern
  const validatePassword = (password) => {
    return passwordPattern.test(password);
  };

  // Check if the retyped password matches the original password
  const validateRetypePassword = (password, retypePassword) => {
    return password === retypePassword;
  };

  // Update profile data state on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Handle form submission and validate inputs
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // Validation checks
    if (!validatePassword(profileData.password)) {
      newErrors.password =
        "Password must contain at least 8 characters, including uppercase, lowercase, and a number";
    }
    if (!validateRetypePassword(profileData.password, retypePassword)) {
      newErrors.retypePassword = "Passwords do not match";
    }
    if (!profileData.first_name) {
      newErrors.first_name = "First name is required";
    }
    if (!profileData.last_name) {
      newErrors.last_name = "Last name is required";
    }
    if (!profileData.city) {
      newErrors.city = "City is required";
    }
    if (!profileData.street_name) {
      newErrors.street_name = "Street name is required";
    }
    if (!profileData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    }

    // If there are errors, update the state and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors({}), 1500); // Clear error messages after 1.5 seconds
      return;
    }

    setIsLoading(true);

    try {
      console.log("profileData", profileData);
      // Make the API request to update profile
      const response = await axios.put("/editProfile/update", {
        ...profileData,
        email: email.email, // Ensure you're sending the correct email string, not an object
      });

      if (response.status === 200) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 1500); // Clear success message after 1.5 seconds
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ general: "Error updating profile. Please try again." });
      setTimeout(() => setErrors({}), 1500); // Clear general error message after 1.5 seconds
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className={classes.form}>
        <input
          type="text"
          placeholder="First Name"
          name="first_name"
          value={profileData.first_name}
          onChange={handleChange}
          className={classes.inputField}
        />
        {errors.first_name && (
          <p className={classes.error}>{errors.first_name}</p>
        )}

        <input
          type="text"
          placeholder="Last Name"
          name="last_name"
          value={profileData.last_name}
          onChange={handleChange}
          className={classes.inputField}
        />
        {errors.last_name && (
          <p className={classes.error}>{errors.last_name}</p>
        )}

        <input
          type="text"
          placeholder="City"
          name="city"
          value={profileData.city}
          onChange={handleChange}
          className={classes.inputField}
        />
        {errors.city && <p className={classes.error}>{errors.city}</p>}

        <input
          type="text"
          placeholder="Street Name"
          name="street_name"
          value={profileData.street_name}
          onChange={handleChange}
          className={classes.inputField}
        />
        {errors.street_name && (
          <p className={classes.error}>{errors.street_name}</p>
        )}

        <input
          type="text"
          placeholder="Phone Number"
          name="phone_number"
          value={profileData.phone_number}
          onChange={handleChange}
          className={classes.inputField}
        />
        {errors.phone_number && (
          <p className={classes.error}>{errors.phone_number}</p>
        )}

        <input
          type="password"
          placeholder="New Password"
          name="password"
          value={profileData.password}
          onChange={handleChange}
          className={classes.inputField}
        />
        {errors.password && <p className={classes.error}>{errors.password}</p>}

        <input
          type="password"
          placeholder="Retype Password"
          value={retypePassword}
          onChange={(e) => setRetypePassword(e.target.value)}
          className={classes.inputField}
        />
        {errors.retypePassword && (
          <p className={classes.error}>{errors.retypePassword}</p>
        )}

        {errors.general && <p className={classes.error}>{errors.general}</p>}

        <button
          type="submit"
          className={classes.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {successMessage && <p className={classes.success}>{successMessage}</p>}
    </div>
  );
};

export default EditProfile;
