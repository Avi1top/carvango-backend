import React, { useState, useEffect } from "react";
import moment from "moment";
import classes from "./editCatering.module.css"; // Import the CSS file

// Function to manage event details, including title, start and end times, visibility, and description.
function EventManagement({ addEvent, updateEvent, currentEvent }) {
  const [title, setTitle] = useState(currentEvent ? currentEvent.title : "");
  const [start, setStart] = useState(
    currentEvent ? moment(currentEvent.start).format("YYYY-MM-DDTHH:mm") : ""
  );
  const [end, setEnd] = useState(
    currentEvent ? moment(currentEvent.end).format("YYYY-MM-DDTHH:mm") : ""
  );
  const [isPublic, setIsPublic] = useState(
    currentEvent ? currentEvent.isPublic : true
  );
  const [description, setDescription] = useState(
    currentEvent ? currentEvent.description : ""
  );
  const [error, setError] = useState(null); // State to hold error messages

  // Effect hook to update state when currentEvent changes, populating form fields with event data.
  useEffect(() => {
    if (currentEvent) {
      setTitle(currentEvent.title);
      setStart(moment(currentEvent.start).format("YYYY-MM-DDTHH:mm"));
      setEnd(moment(currentEvent.end).format("YYYY-MM-DDTHH:mm"));
      setIsPublic(currentEvent.isPublic);
      setDescription(currentEvent.description);
    }
  }, [currentEvent]);

  // Handles form submission, validating dates and either adding or updating the event.
  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedEvent = {
      title,
      start: new Date(start),
      end: new Date(end),
      isPublic,
      description,
    };

    // Validate event dates
    if (new Date(start) >= new Date(end)) {
      setError("Start date and time must be before end date and time.");
      return;
    }

    if (currentEvent) {
      updateEvent(currentEvent.id, updatedEvent);
    } else {
      addEvent(updatedEvent);
    }
  };

  // Renders the form for event details, including title, dates, description, and visibility options.
  return (
    <div className={classes.formContainer}>
      <h1>{currentEvent ? "Edit Event" : "Add Event"}</h1>
      <form className={classes.eventForm} onSubmit={handleSubmit}>
        <div className={classes.formGroup}>
          <label htmlFor="title-input">Event Title:</label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={classes.input}
          />
        </div>

        <div className={classes.formRow}>
          <div className={classes.formGroup}>
            <label htmlFor="start-input">Start Date:</label>
            <input
              id="start-input"
              type="datetime-local"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                if (new Date(e.target.value) >= new Date(end)) {
                  setEnd(e.target.value); // Reset end date if it's before the new start date
                }
              }}
              required
              className={classes.input}
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="end-input">End Date:</label>
            <input
              id="end-input"
              type="datetime-local"
              value={end}
              onChange={(e) => {
                const newEnd = e.target.value;
                if (new Date(start) >= new Date(newEnd)) {
                  setError(
                    "End date and time must be after start date and time."
                  );
                } else {
                  setError(null);
                  setEnd(newEnd);
                }
              }}
              min={start}
              required
              className={classes.input}
            />
          </div>
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="description-input">Event Description:</label>
          <textarea
            id="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for the event"
            className={classes.textarea}
          />
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="public-checkbox">
            <input
              id="public-checkbox"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className={classes.checkbox}
            />
            Public Event
          </label>
        </div>

        {error && (
          <p id="error-message" className={classes.errorMessage}>
            {error}
          </p>
        )}

        <button type="submit" className={classes.submitButton}>
          {currentEvent ? "Update Event" : "Add Event"}
        </button>
      </form>
    </div>
  );
}

export default EventManagement;
