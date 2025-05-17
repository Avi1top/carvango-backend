import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Reviews.module.css";
import { Rating } from "@mui/material"; // For star rating
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Icons for navigation

const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("/reviews");
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

  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length
    );
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className={styles.errorMessage}>
        {error}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!reviews.length) {
    return <div className={styles.noReviews}>No reviews available.</div>;
  }

  const currentReview = reviews[currentIndex];
  const prevReviewIndex = (currentIndex - 1 + reviews.length) % reviews.length;
  const nextReviewIndex = (currentIndex + 1) % reviews.length;

  return (
    <div className={styles.carouselContainer}>
      <FaArrowLeft className={styles.arrow} onClick={prevReview} />
      <div className={styles.reviewCard}>
        <img
          src={reviews[prevReviewIndex].profile_photo_url}
          alt="Previous Review"
          className={styles.smallReview}
        />
      </div>
      <div className={`${styles.reviewCard} ${styles.activeReview}`}>
        <img
          src={currentReview.profile_photo_url}
          alt={currentReview.author_name}
          className={styles.profileImage}
        />
        <h3>{currentReview.author_name}</h3>
        <Rating value={currentReview.rating} readOnly />
        <p>{currentReview.text}</p>
      </div>
      <div className={styles.reviewCard}>
        <img
          src={reviews[nextReviewIndex].profile_photo_url}
          alt="Next Review"
          className={styles.smallReview}
        />
      </div>
      <FaArrowRight className={styles.arrow} onClick={nextReview} />
    </div>
  );
};

export default ReviewsCarousel;
