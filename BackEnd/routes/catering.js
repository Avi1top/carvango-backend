// Import necessary modules and initialize the router
const express = require("express");
const router = express.Router();
const doQuery = require("../database/query");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const path = require('path');
const fs = require('fs');

// GET: Fetch all events
// Retrieves all events from the database and returns them as JSON.
router.get("/events", async (req, res) => {
  try {
    const events = await doQuery("SELECT * FROM events");
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
});

// GET: Fetch a single event by ID
// Retrieves a specific event by its ID and returns it as JSON.
router.get("/events/:id", async (req, res) => {
  try {
    const event = await doQuery("SELECT * FROM events WHERE id = ?", [
      req.params.id,
    ]);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Error fetching event" });
  }
});

// POST: Add a new event
// Adds a new event to the database and returns the full event details.
router.post("/events", async (req, res) => {
  const { title, start, end, isPublic, description } = req.body;
  if (!title || !start || !end) {
    return res
      .status(400)
      .json({ error: "Title, start, and end are required" });
  }

  try {
    const result = await doQuery(
      "INSERT INTO events (title, start, end, isPublic, description) VALUES (?, ?, ?, ?, ?)",
      [title, start, end, isPublic, description]
    );

    const newEvent = await doQuery("SELECT * FROM events WHERE id = ?", [
      result.insertId,
    ]); // Fetch full event details
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ error: "Error adding event" });
  }
});

// POST: Get event ID by details
// Finds an event by its details and returns the event ID if found.
router.post("/events/find", async (req, res) => {
  const { title, start, end, isPublic, description } = req.body;

  // Validate required fields
  if (!title || !start || !end || isPublic === undefined) {
    return res
      .status(400)
      .json({ error: "Title, start, end, and isPublic are required" });
  }

  try {
    // Query to find the event by matching all provided details
    const event = await doQuery(
      "SELECT id FROM events WHERE title = ? AND start = ? AND end = ? AND isPublic = ? AND description = ?",
      [title, start, end, isPublic, description]
    );

    // Check if any event matches the criteria
    if (event.length > 0) {
      res.status(200).json(event[0]); // Return the event ID
    } else {
      res.status(404).json({ message: "No matching event found" });
    }
  } catch (error) {
    console.error("Error finding event:", error);
    res.status(500).json({ error: "Error finding event" });
  }
});

// PUT: Update an existing event
// Updates an existing event's details in the database.
router.put("/events/:id", async (req, res) => {
  const { title, start, end, isPublic, description } = req.body;

  console.log(description,"descccccccc")
  if (!title || !start || !end) {
    return res
      .status(400)
      .json({ error: "Title, start, and end are required" });
  }

  try {
    await doQuery(
      "UPDATE events SET title = ?, start = ?, end = ?, isPublic = ?, description = ? WHERE id = ?",
      [title, start, end, isPublic, description, req.params.id]
    );

    const updatedEvent = await doQuery("SELECT * FROM events WHERE id = ?", [
      req.params.id,
    ]); // Fetch updated event details
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Error updating event" });
  }
});

// DELETE: Delete an event
// Deletes an event from the database by its ID.
router.delete("/events/:id", async (req, res) => {
  try {
    const deleteResult = await doQuery("DELETE FROM events WHERE id = ?", [
      req.params.id,
    ]);
    if (deleteResult.affectedRows > 0) {
      res.status(200).json({ message: "Event deleted successfully" });
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Error deleting event" });
  }
});

// GET: Fetch all images
// Retrieves all catering images from the database and returns them as JSON.
router.get("/images", async (req, res) => {
  try {
    const images = await doQuery("SELECT * FROM catering_images ORDER BY `order` ASC");
    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Error fetching images" });
  }
});

// POST: Upload a new image
// Uploads a new image and saves its path and order in the database.
router.post("/images", upload.single("image"), async (req, res) => {
  const { order } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!imagePath) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const result = await doQuery(
      "INSERT INTO catering_images (path, `order`) VALUES (?, ?)",
      [imagePath, order]
    );
    res.status(201).json({ id: result.insertId, path: imagePath, order });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Error uploading image" });
  }
});

// PUT: Update image order
// Updates the display order of an image in the database.
router.put("/images/:id/order", async (req, res) => {
  const { order } = req.body;

  try {
    await doQuery("UPDATE catering_images SET `order` = ? WHERE id = ?", [
      order,
      req.params.id,
    ]);
    res.status(200).json({ message: "Image order updated successfully" });
  } catch (error) {
    console.error("Error updating image order:", error);
    res.status(500).json({ error: "Error updating image order" });
  }
});

// DELETE: Delete an image
// Deletes an image from the database by its ID.
router.delete("/images/:id", async (req, res) => {
  try {
    const deleteResult = await doQuery("DELETE FROM catering_images WHERE id = ?", [
      req.params.id,
    ]);
    if (deleteResult.affectedRows > 0) {
      res.status(200).json({ message: "Image deleted successfully" });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Error deleting image" });
  }
});

// POST: Upload header image
// Uploads a new header image and replaces the existing one if present.
router.post('/uploadHeaderImage', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const imagePath = `/uploads/${req.file.filename}`;

  try {
    // Fetch the current header image path
    const [currentHeaderImage] = await doQuery('SELECT path FROM catering_images WHERE `order` = 0 ORDER BY upload_date DESC LIMIT 1');

    // Insert the new header image path into the database
    const result = await doQuery('INSERT INTO catering_images (path, `order`, upload_date) VALUES (?, ?, NOW())', [imagePath, 0]);

    // Delete the old header image file if it exists
    if (currentHeaderImage) {
      const oldImagePath = path.join(__dirname, '..', 'public', currentHeaderImage.path);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old header image:', err);
        }
      });

      // Remove the old header image record from the database
      await doQuery('DELETE FROM catering_images WHERE id = ?', [currentHeaderImage.id]);
    }

    res.json({ id: result.insertId, imagePath });
  } catch (error) {
    console.error('Error inserting header image into database:', error);
    res.status(500).send('Error inserting header image');
  }
});

// GET: Fetch header image
// Retrieves the current header image from the database.
router.get('/headerImage', async (req, res) => {
  try {
    const [result] = await doQuery('SELECT path FROM catering_images WHERE `order` = 0 ORDER BY upload_date DESC LIMIT 1');
    res.json({ headerImage: result.path });
  } catch (error) {
    console.error('Error fetching header image:', error);
    res.status(500).send('Error fetching header image');
  }
});

// DELETE: Delete the old header image
// Deletes the current header image from the server and database.
router.delete('/deleteHeaderImage', async (req, res) => {
  const { path: imagePath } = req.body;

  if (!imagePath) {
    return res.status(400).json({ error: "Image path is required" });
  }

  try {
    // Fetch the image record from the database
    const [imageRecord] = await doQuery('SELECT * FROM catering_images WHERE path = ?', [imagePath]);

    if (!imageRecord) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Construct the full path to the image file
    const fullImagePath = path.join(__dirname, '..', 'public', imagePath);

    // Log the full path for debugging
    console.log('Attempting to delete file at path:', fullImagePath);

    // Check if the file exists before attempting to delete it
    if (fs.existsSync(fullImagePath)) {
      // Delete the image file from the server
      fs.unlink(fullImagePath, async (err) => {
        if (err) {
          console.error('Error deleting old header image:', err);
          return res.status(500).json({ error: `Error deleting old header image: ${err.message}` });
        }

        // Remove the old header image record from the database
        const deleteResult = await doQuery('DELETE FROM catering_images WHERE path = ?', [imagePath]);

        if (deleteResult.affectedRows > 0) {
          res.status(200).json({ message: "Old header image deleted successfully" });
        } else {
          res.status(404).json({ message: "Image not found" });
        }
      });
    } else {
      console.error('File does not exist:', fullImagePath);
      // Remove the old header image record from the database even if the file does not exist
      const deleteResult = await doQuery('DELETE FROM catering_images WHERE path = ?', [imagePath]);

      if (deleteResult.affectedRows > 0) {
        res.status(200).json({ message: "Old header image record deleted successfully, but file was not found" });
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    }
  } catch (error) {
    console.error('Error deleting old header image:', error);
    res.status(500).json({ error: "Error deleting old header image" });
  }
});

module.exports = router;
