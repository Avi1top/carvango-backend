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
import { FaChevronLeft, FaChevronRight ,FaTimes} from "react-icons/fa";
// Import statements at the top
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

// Define custom formats for 24-hour time using Moment.js
const formats = {
  // Formats the time in the sidebar (time gutter)
  timeGutterFormat: (date, culture, localizer) =>
    localizer.format(date, "HH:mm", culture),

  // Formats the event time range (on events)
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(end, "HH:mm", culture)}`,

  // Formats the agenda time range
  agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(end, "HH:mm", culture)}`,

  // Formats the toolbar date
  dayFormat: "dddd", // e.g., "Monday"

  // Formats the header of the day view
  dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, "DD/MM/YYYY", culture)} - ${localizer.format(end, "DD/MM/YYYY", culture)}`,
};

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
 const [selectedDate, setSelectedDate] = useState(new Date());

 // Handle date change
 const handleDateChange = (event) => {
   const newDate = new Date(event.target.value);
   setSelectedDate(newDate);
 };
  // Function to fetch images from the server, excluding the header image.
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

  // Function to fetch header image and events on component mount.
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
  // Function to handle image click to open modal with image details.
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

  // Function to close the image modal.
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // Function to validate event details before adding or updating.
  const validateEvent = (event) => {
    if (!event.title || !event.description) {
      return "Title and description are required.";
    }
    if (new Date(event.start) >= new Date(event.end)) {
      return "Start date must be before end date.";
    }
    return null;
  };

  // Function to add a new event to the calendar.
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
      await fetchEvents(); // Refetch events after adding a new one
    } catch (error) {
      console.error("Error adding event:", error);
    }
    setShowEventForm(false);
  };

  // Function to update an existing event in the calendar.
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

  // Function to delete an event from the calendar.
  const deleteEvent = async (id) => {
    try {
      await axios.delete(`/catering/events/${id}`);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Function to handle event edit action.
  const handleEditEvent = (event) => {
    if (isAuthenticated) {
      setCurrentEvent(event);
      setShowEventForm(true);
    } 
  };

  // Function to handle double click on event to open dialog.
  const handleDoubleClickEvent = (event) => {
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  // Function to close the event details dialog.
  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentEvent(null);
  };

  // Function to open delete confirmation dialog.
  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  // Function to close delete confirmation dialog.
  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  // Function to filter events based on authentication status.
  const filteredEvents = isAuthenticated
    ? events
    : events.filter((event) => event.isPublic);

  // Function to handle scroll in image carousel.
  const handleScroll = (direction) => {
    const container = document.querySelector(`.${classes.imageQueue}`);
    const scrollAmount = direction * container.clientWidth; // Adjust the scroll amount to the container width
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Function to open the photo manager modal.
  const openPhotoManager = () => {
    setIsPhotoManagerOpen(true);
  };

  // Function to close the photo manager and refresh images.
  const closePhotoManager = async () => {
    setIsPhotoManagerOpen(false);
    await fetchImages(newHeaderImage); // Refresh images after closing the modal
  };

  // Function to handle header image upload.
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
        <h1>Our Calendar</h1>
        <div className={classes.calendarWrapper}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <input
              type="date"
              value={moment(selectedDate).format("YYYY-MM-DD")}
              onChange={handleDateChange}
            />
          </div>
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
              }
            }}
            formats={formats} // Apply custom 24-hour formats
            onNavigate={(date) => setSelectedDate(date)} // Update state on calendar navigation
            date={selectedDate} // Set the calendar's date to the selected date
          />
        </div>
      </section>
      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        aria-labelledby="event-dialog-title"
      >
        <DialogTitle
          id="event-dialog-title"
          sx={{ fontSize: "3rem", fontWeight: "bold" }}
        >
          {currentEvent ? currentEvent.title : "Event Details"}
        </DialogTitle>
        <DialogContent dividers>
          {currentEvent && (
            <div>
              {/* Start Date and End Date in DialogContent */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h5" sx={{ color: "#333" }}>
                  <strong style={{ color: "#0050b3" }}>Start Date:</strong>{" "}
                  {new Date(currentEvent.start).toLocaleString("en-GB", {
                    hour12: false,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <Typography variant="h5" sx={{ color: "#333", marginLeft: "10px" }}>
                  <strong style={{ color: "#0050b3" }}>End Date:</strong>{" "}
                  {new Date(currentEvent.end).toLocaleString("en-GB", {
                    hour12: false,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>

              {/* Event Description */}
              <Typography
                variant="body1" // Choose a variant that suits your design
                sx={{ color: "#333", fontSize: "1.4rem" }} // Customize font size as needed
              >
                {currentEvent.description}
              </Typography>
            </div>
          )}
        </DialogContent>

        <DialogActions style={{ justifyContent: "space-between" }}>
          {isAuthenticated && currentEvent && (
            <Button
              onClick={openDeleteConfirm}
              color="secondary"
              sx={{ fontSize: "1rem" }}
            >
              Delete
            </Button>
          )}
          <Button
            onClick={closeDialog}
            color="primary"
            sx={{ fontSize: "1rem" }}
          >
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
        <DialogContent
          className={classes.imageModalContent}
          style={{ padding: 0 }}
        >
          {selectedImage && (
            <>
              <img
                src={selectedImage.path}
                alt="Selected"
                className={classes.enlargedImage}
              />
              <button
                onClick={closeImageModal}
                className={classes.closeButton}
                aria-label="Close image"
                style={{
                  position: "absolute", // Position the button absolutely
                  top: "0", // Adjust top position as needed
                  right: "0", // Adjust right position as needed
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FaTimes size={24} color="black" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default Catering;