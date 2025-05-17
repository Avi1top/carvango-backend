import React, { useState, useEffect } from "react";
import moment from "moment";

// Manages event details including title, start and end times, visibility, and description.
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

  // Updates form fields when currentEvent changes, populating with event data.
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
    <div>
      <h1>{currentEvent ? "Edit Event" : "Add Event"}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Event Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Start Date:</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (new Date(e.target.value) >= new Date(end)) {
                setEnd(e.target.value); // Reset end date if it's before the new start date
              }
            }}
            required
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => {
              const newEnd = e.target.value;
              if (new Date(start) >= new Date(newEnd)) {
                setError("End date and time must be after start date and time.");
              } else {
                setError(null);
                setEnd(newEnd);
              }
            }}
            min={start} // Set minimum end date to the start date and time
            required
          />
        </div>
        <div>
          <label>Event Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for the event"
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public Event
          </label>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error message */}
        <button type="submit">
          {currentEvent ? "Update Event" : "Add Event"}
        </button>
      </form>
    </div>
  );

  // Updates the start date and resets end date if the new start date is later.
  const handleStartChange = (e) => {
    setStart(e.target.value);
    if (new Date(e.target.value) >= new Date(end)) {
      setEnd(e.target.value); // Reset end date if it's before the new start date
    }
  };

  // Updates the end date and validates it against the start date.
  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    if (new Date(start) >= new Date(newEnd)) {
      setError("End date and time must be after start date and time.");
    } else {
      setError(null);
      setEnd(newEnd);
    }
  };
}

export default EventManagement;
