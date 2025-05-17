import React, { useState, useEffect } from "react";
import axios from "axios";
import classes from "./photoManager.module.css";

const PhotoManager = ({ onClose, headerImagePath }) => {
  const [photos, setPhotos] = useState([]);
  const [refresh, setRefresh] = useState(false); // State to trigger re-render

  // Fetches photos from the server, excluding the header image from the list.
  const fetchPhotos = async () => {
    try {
      const response = await axios.get("/catering/images");
      const filteredPhotos = response.data.filter(photo => photo.path !== headerImagePath); // Exclude the header image
      setPhotos(filteredPhotos);
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  // Effect hook to fetch photos whenever headerImagePath or refresh state changes.
  useEffect(() => {
    fetchPhotos();
  }, [headerImagePath, refresh]); // Add refresh to dependency array

  // Updates the order of a photo based on its ID and new order value.
  const updatePhotoOrder = async (id, newOrder) => {
    const order = Math.max(1, newOrder); // Ensure order is at least 1
    try {
      await axios.put(`/catering/images/${id}/order`, { order });
      setRefresh(prev => !prev); // Trigger re-render
    } catch (error) {
      console.error("Error updating photo order:", error);
    }
  };

  // Deletes a photo from the server and updates the local state to remove it.
  const deletePhoto = async (id) => {
    try {
      await axios.delete(`/catering/images/${id}`);
      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  // Handles the upload of a new photo, sending it to the server and updating the state.
  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("order", photos.length);

    try {
      const response = await axios.post("/catering/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setPhotos([...photos, response.data]);
      setRefresh(prev => !prev); // Trigger re-render
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Renders a single photo item with its image, order input, and delete button.
  const renderPhotoItem = (photo) => (
    <li key={photo.id} className={classes.photoItem}>
      <img
        src={photo.path}
        alt={`Photo ${photo.id}`}
        className={classes.photo}
      />
      <label className={classes.label}>Order:</label>
      <input
        type="number"
        value={photo.order}
        onChange={(e) => updatePhotoOrder(photo.id, e.target.value)}
        className={classes.orderInput}
      />
      <button
        onClick={() => deletePhoto(photo.id)}
        className={classes.deleteButton}
      >
        Delete
      </button>
    </li>
  );

  // Main return function to render the photo manager UI, including upload and photo list.
  return (
    <div className={classes.photoManager}>
      <h2>Manage Photos</h2>

      {/* Label for the file input */}
      <label htmlFor="file-upload" className={classes.label}>
        Upload a new photo:
      </label>
      <input id="file-upload" type="file" onChange={uploadPhoto} />

      {/* Section label for the photo list */}
      <h3 className={classes.sectionTitle}>Photo List</h3>
      <div className={classes.photoListContainer}>
        <ul>{photos.map(renderPhotoItem)}</ul>
      </div>

      <button onClick={onClose} className={classes.closeButton}>
        Close
      </button>
    </div>
  );
};

export default PhotoManager;
