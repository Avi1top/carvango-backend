const express = require("express");
const axios = require("axios");
const router = express.Router();
const GOOGLE_PLACES_API_KEY = "AIzaSyCwvFKsi2ciiASnWMY_H6IHuX-e_0bwBUY";

// Replace with the Place ID of the business you want reviews for
const PLACE_ID = "ChIJP6CxObW7HRURoPr_GGJBLiU";
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&key=${GOOGLE_PLACES_API_KEY}&fields=reviews`
    );
    const reviews = response.data.result.reviews;
    console.log(reviews);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching reviews");
  }
});

module.exports = router;
