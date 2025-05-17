import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import styles from "./ContactUs.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Reviews from "../reviews/Reviews"; // Import the Reviews component

function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    message: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error immediately when user starts typing
    setErrors({ ...errors, [name]: false });
  };

  const validate = () => {
    const newErrors = {
      name: formData.name === "",
      email: formData.email === "" || !/\S+@\S+\.\S+/.test(formData.email),
      message: formData.message === "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.post(
          "/contact/send-contact-email",
          formData
        );
        if (response.status === 200) {
          alert("Message sent successfully!");
          setFormData({ name: "", email: "", message: "" });
          navigate("/home");
        } else {
          alert("An error occurred. Please try again.");
        }
      } catch (error) {
        console.error("Error sending email:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors({
        name: false,
        email: false,
        message: false,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [errors]);


return (
  <div className={styles.container}>
    <h1 className={styles.header}>Contact Us</h1>
    <div className={styles.flexContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          helperText={
            errors.name ? (
              <span style={{ fontSize: "1.5rem" }}>Name is required</span>
            ) : (
              ""
            )
          }
          fullWidth
          margin="normal"
          InputProps={{
            style: { fontSize: "1.8rem" },
          }}
          InputLabelProps={{
            style: { fontSize: "1.8rem" },
          }}
          placeholder="Enter your name"
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          helperText={
            errors.email ? (
              <span style={{ fontSize: "1.5rem" }}>
                Valid email is required
              </span>
            ) : (
              ""
            )
          }
          fullWidth
          margin="normal"
          InputProps={{
            style: { fontSize: "1.8rem" },
          }}
          InputLabelProps={{
            style: { fontSize: "1.8rem" },
          }}
          placeholder="Enter your email"
        />
        <TextField
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
          helperText={
            errors.message ? (
              <span style={{ fontSize: "1.5rem" }}>Message is required</span>
            ) : (
              ""
            )
          }
          fullWidth
          margin="normal"
          multiline
          rows={4}
          InputProps={{
            style: { fontSize: "1.8rem" },
          }}
          InputLabelProps={{
            style: { fontSize: "1.8rem" },
          }}
          placeholder="Enter your message"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={styles.btnSubmit}
          style={{ fontSize: "1.8rem" }}
        >
          Submit
        </Button>
      </form>

      {/* Add the Reviews component here */}
      <div className={styles.reviewsSection}>
        <Reviews />
      </div>
    </div>
  </div>
);
}


export default ContactUs;
