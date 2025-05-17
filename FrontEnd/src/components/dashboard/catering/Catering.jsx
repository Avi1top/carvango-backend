import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import classes from "./catering.module.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventManagement from "./editCatering";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { AuthContext } from "../../contexts/session/AuthContext "; // Import AuthContext
import PhotoManager from "./PhotoManager";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const localizer = momentLocalizer(moment);

function Catering() {
  const { isAuthenticated } = useContext(AuthContext); // Use AuthContext
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null); // State to hold error messages
  const [images, setImages] = useState([]); // State to hold images
  const [selectedImage, setSelectedImage] = useState(null); // State to hold selected image for modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // State to control image modal
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState(false);
  const [newHeaderImage, setNewHeaderImage] = useState(null); // State to hold new header image
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // State to control delete confirmation dialog

  // Fetches images from the server, excluding the header image.
  const fetchImages = async (headerImagePath) => {
    try {
      const response = await axios.get("/catering/images");
      const filteredImages = response.data.filter(
        (img) => img.path !== headerImagePath
      ); // Exclude the header image
      setImages(filteredImages);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Fetches header image and events on component mount.
  useEffect(() => {
    const fetchHeaderImage = async () => {
      try {
        const response = await axios.get("/catering/headerImage");
        setNewHeaderImage(response.data.headerImage);
        await fetchImages(response.data.headerImage); // Fetch images excluding the header image
      } catch (error) {
        console.error("Error fetching header image:", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get("/catering/events");
        const formattedEvents = response.data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const initializeData = async () => {
      await fetchHeaderImage();
      await fetchEvents();
    };

    initializeData();
  }, []);

  // Handles image click to open modal with image details.
  const handleImageClick = (img) => {
    const image = new Image();
    image.src = img.path;
    image.onload = () => {
      setSelectedImage({
        ...img,
        width: image.width,
        height: image.height,
      });
      setIsImageModalOpen(true);
    };
  };

  // Closes the image modal.
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // Validates event details before adding or updating.
  const validateEvent = (event) => {
    if (!event.title || !event.description) {
      return "Title and description are required.";
    }
    if (new Date(event.start) >= new Date(event.end)) {
      return "Start date must be before end date.";
    }
    return null;
  };

  // Adds a new event to the calendar.
  const addEvent = async (event) => {
    const validationError = validateEvent(event);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000); // Clear error message after 5 seconds
      return;
    }

    try {
      event.start = new Date(event.start);
      event.end = new Date(event.end);
      const response = await axios.post("/catering/events", event);
      setEvents((prevEvents) => [...prevEvents, response.data]);
      setError(null); // Clear error message
    } catch (error) {
      console.error("Error adding event:", error);
    }
    setShowEventForm(false);
  };

  // Updates an existing event in the calendar.
  const updateEvent = async (id, updatedEvent) => {
    const validationError = validateEvent(updatedEvent);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000); // Clear error message after 5 seconds
      return;
    }

    try {
      const response = await axios.put(`/catering/events/${id}`, updatedEvent);
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === id ? response.data : event))
      );
      setError(null); // Clear error message
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setShowEventForm(false);
  };

  // Deletes an event from the calendar.
  const deleteEvent = async (id) => {
    try {
      await axios.delete(`/catering/events/${id}`);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Handles event edit action.
  const handleEditEvent = (event) => {
    if (isAuthenticated) {
      setCurrentEvent(event);
      setShowEventForm(true);
    } else {
      alert("Please log in to edit events.");
    }
  };

  // Handles double click on event to open dialog.
  const handleDoubleClickEvent = (event) => {
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  // Closes the event details dialog.
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentEvent(null);
  };

  // Opens delete confirmation dialog.
  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  // Closes delete confirmation dialog.
  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  // Filters events based on authentication status.
  const filteredEvents = isAuthenticated
    ? events
    : events.filter((event) => event.isPublic);

  // Handles scroll in image carousel.
  const handleScroll = (direction) => {
    const container = document.querySelector(`.${classes.imageQueue}`);
    const scrollAmount = direction * container.clientWidth; // Adjust the scroll amount to the container width
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Opens the photo manager modal.
  const openPhotoManager = () => {
    setIsPhotoManagerOpen(true);
  };

  // Closes the photo manager and refreshes images.
  const closePhotoManager = async () => {
    setIsPhotoManagerOpen(false);
    await fetchImages(newHeaderImage); // Refresh images after closing the modal
  };

  // Handles header image upload.
  const handleHeaderImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      setUploadStatus("Uploading...");

      try {
        // Delete the old header image before uploading the new one
        if (newHeaderImage) {
          await axios.delete(`/catering/deleteHeaderImage`, {
            data: { path: newHeaderImage },
          });
        }

        const response = await axios.post(
          "/catering/uploadHeaderImage",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setNewHeaderImage(response.data.imagePath);
        setUploadStatus("Upload successful!");

        // Clear upload status after 5 seconds
        setTimeout(() => setUploadStatus(null), 5000);

        // Fetch images again to ensure the new header image is excluded
        await fetchImages(response.data.imagePath);
      } catch (error) {
        console.error("Error uploading header image:", error);
        setUploadStatus(
          `Upload failed: ${
            error.response?.data?.message || error.message
          }. Please try again.`
        );

        // Clear upload status after 5 seconds
        setTimeout(() => setUploadStatus(null), 5000);
      }
    }
  };

  let touchTimer; // Declare touchTimer outside the function

  // Main return function to render the component.
  return (
    <main className={classes.main}>
      <section className={classes.headerSection}>
        {newHeaderImage ? (
          <img
            src={newHeaderImage}
            alt="Food Truck"
            className={classes.headerImage}
          />
        ) : (
          <div>Loading...</div>
        )}
        {isAuthenticated && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeaderImageUpload}
              style={{ display: "none" }}
              id="headerImageUpload"
            />
            <label htmlFor="headerImageUpload" className={classes.uploadButton}>
              Change Header Image
            </label>
            {uploadStatus && (
              <p className={classes.uploadStatus}>{uploadStatus}</p>
            )}
          </div>
        )}
        <h1>Food Truck</h1>
        <p>
          From corporate events to weddings, Zia's is ready to provide the
          perfect culinary backdrop. events to weddings, Zia's is ready to
          provide the perfect culinary backdrop. events to weddings, Zia's is
          ready to provide the perfect culinary backdrop. events to weddings,
          Zia's is ready to provide the perfect culinary backdrop. events to
          weddings, Zia's is ready to provide the perfect culinary backdrop.
        </p>
      </section>
      {isAuthenticated && (
        <button
          onClick={openPhotoManager}
          className={classes.managePhotosButton}
        >
          Manage Photos
        </button>
      )}
      {isPhotoManagerOpen && (
        <PhotoManager
          onClose={closePhotoManager}
          headerImagePath={newHeaderImage} // Pass the header image path to PhotoManager
        />
      )}
      <section className={classes.imagesSection}>
        <h2>Our Best Sellers</h2>
        <div className={classes.carousel}>
          <button
            className={classes.carouselButton}
            onClick={() => handleScroll(-1)}
            aria-label="Previous image"
          >
            <FaChevronLeft size={24} />
          </button>
          <div className={classes.imageQueue}>
            {images.map((img, index) => (
              <div key={index} className={classes.imageWrapper}>
                <img
                  src={img.path}
                  alt={`Event ${index + 1}`}
                  className={classes.image}
                  onClick={() => handleImageClick(img)}
                />
              </div>
            ))}
          </div>
          <button
            className={classes.carouselButton}
            onClick={() => handleScroll(1)}
            aria-label="Next image"
          >
            <FaChevronRight size={24} />
          </button>
        </div>
      </section>
      {isAuthenticated && (
        <button
          className={classes.moreInfoButton}
          onClick={() => {
            setCurrentEvent(null);
            setShowEventForm(!showEventForm);
          }}
        >
          {showEventForm ? "Cancel" : "Add New Event"}
        </button>
      )}
      {showEventForm && isAuthenticated && (
        <EventManagement
          addEvent={addEvent}
          updateEvent={updateEvent}
          currentEvent={currentEvent}
        />
      )}
      {error && <p className={classes.error}>{error}</p>}{" "}
      {/* Display error message */}
      <section className={classes.calendarSection}>
        <h1>React Big Calendar</h1>
        <div className={classes.calendarWrapper}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            selectable
            onSelectEvent={handleEditEvent}
            onDoubleClickEvent={handleDoubleClickEvent}
            onTouchStart={(e) => {
              e.persist();
              touchTimer = setTimeout(() => {
                handleDoubleClickEvent(e); // Call the same function
              }, 500); // Long press duration
            }}
            onTouchEnd={() => {
              clearTimeout(touchTimer); // Clear the timer on touch end
            }}
            onSelectSlot={() => {
              if (isAuthenticated) {
                setCurrentEvent(null);
                setShowEventForm(true);
              } else {
                alert("Please log in to add events.");
              }
            }}
          />
        </div>
      </section>
      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        aria-labelledby="event-dialog-title"
      >
        <DialogTitle id="event-dialog-title">Event Details</DialogTitle>
        <DialogContent>
          {currentEvent && (
            <div>
              <p>
                <strong>Title:</strong> {currentEvent.title}
              </p>
              <p>
                <strong>Start:</strong> {currentEvent.start.toString()}
              </p>
              <p>
                <strong>End:</strong> {currentEvent.end.toString()}
              </p>
              <p>
                <strong>Description:</strong> {currentEvent.description}
              </p>
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          {isAuthenticated && currentEvent && (
            <Button onClick={openDeleteConfirm} color="secondary">
              Delete
            </Button>
          )}
          <Button onClick={closeDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        aria-labelledby="delete-confirm-dialog-title"
      >
        <DialogTitle id="delete-confirm-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this event?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              deleteEvent(currentEvent.id);
              closeDeleteConfirm();
              closeDialog();
            }}
            color="secondary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isImageModalOpen}
        onClose={closeImageModal}
        aria-labelledby="image-dialog-title"
        maxWidth={false} /* Disable maxWidth to allow custom sizing */
        PaperProps={{
          style: {
            width: selectedImage ? selectedImage.width : "auto",
            height: selectedImage ? selectedImage.height : "auto",
          },
        }}
      >
        <DialogContent className={classes.imageModalContent}>
          {selectedImage && (
            <img
              src={selectedImage.path}
              alt="Selected"
              className={classes.enlargedImage}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default Catering;