import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Reviews.module.css"; // Import the updated CSS file
import { Rating, List, ListItem } from "@mui/material"; // For the star rating
import LoadingScreen from "../LoadingScreen/LoadingScreen";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("/reviews"); // Adjust API path if necessary
        setReviews(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Failed to load reviews");
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.reviewsContainer}>
      <h2 className={styles.reviewsHeader}>Customer Reviews</h2>
      <List
        style={{
          maxHeight: 400,
          overflow: "hidden", // Initially hide the scrollbar
          position: "relative",
          transition: "overflow-y 0.8s ease", // Add transition for smooth effect
        }}
        onMouseEnter={(e) => (e.currentTarget.style.overflow = "auto")} // Show scrollbar on hover
        onMouseLeave={(e) => (e.currentTarget.style.overflow = "hidden")} // Hide scrollbar when not hovering
      >
        {reviews
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10) // Limit to 10 reviews
          .map((review, index) => (
            <ListItem key={index} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <img
                  className={styles.profileImage}
                  src={review.profile_photo_url}
                  alt={review.author_name}
                />
                <div className={styles.reviewInfo}>
                  <a
                    href={review.author_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.authorName}
                  >
                    {review.author_name}
                  </a>
                  <Rating
                    name="read-only"
                    value={review.rating}
                    readOnly
                    size="small"
                    className={styles.ratingStars}
                  />
                  <p className={styles.reviewDate}>
                    {review.relative_time_description}
                  </p>
                </div>
              </div>
              <p className={styles.reviewText}>{review.text}</p>
            </ListItem>
          ))}
      </List>
      <a
        href="https://search.google.com/local/writereview?placeid=ChIJySL51KIdaEgRYJvVzzNqieg"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className={styles.reviewsButton}>Write a Review</button>
      </a>
    </div>
  );
};

export default Reviews;
