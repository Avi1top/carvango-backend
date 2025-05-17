import React, { useEffect, useState, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import axios from "axios";
import { Rating } from "@mui/material"; // For star rating
import LoadingScreen from "../../LoadingScreen/LoadingScreen";
// import "./base.css";
import "./embla.css";

const OPTIONS = { loop: true };
const AUTOPLAY_INTERVAL = 3000; // 3 seconds interval for autoplay
const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number, min, max) =>
  Math.min(Math.max(number, min), max);

const EmblaCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef([]);
  const autoplayTimer = useRef(null); // Ref to manage the autoplay interval

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get("/reviews"); // Adjust API path if needed
      setReviews(response.data); // Limit to 5 reviews for the carousel
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
      setLoading(false);
    }
  }, []);

  const setTweenNodes = useCallback((emblaApi) => {
    tweenNodes.current = emblaApi
      .slideNodes()
      .map((slideNode) => slideNode.querySelector(".embla__slide__content"));
  }, []);

  const setTweenFactor = useCallback((emblaApi) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback((emblaApi, eventName) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();

    emblaApi.scrollSnapList().forEach((snap, snapIndex) => {
      let diffToTarget = snap - scrollProgress;
      engine.slideRegistry[snapIndex].forEach((slideIndex) => {
        if (!slidesInView.includes(slideIndex) && eventName === "scroll")
          return;

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
        const scale = numberWithinRange(tweenValue, 0, 1).toString();
        const tweenNode = tweenNodes.current[slideIndex];
        tweenNode.style.transform = `scale(${scale})`;
      });
    });
  }, []);

  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    autoplayTimer.current = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0); // Loop back to the first slide
    }, AUTOPLAY_INTERVAL);
  }, [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
  }, []);

  useEffect(() => {
    fetchReviews();

    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    autoplay(); // Start autoplay on mount

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale);

    // Stop autoplay when user interacts with the carousel
    emblaApi.on("pointerDown", stopAutoplay);

    // Clean up interval on unmount
    return () => stopAutoplay();
  }, [emblaApi, fetchReviews, autoplay, stopAutoplay]);

  if (loading) return <LoadingScreen />;
  if (error) return <p>{error}</p>;

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {reviews.map((review, index) => (
            <div className="embla__slide" key={index}>
              <div className="embla__slide__content">
                <div className="review-header">
                  <img
                    className="profile-image"
                    src={review.profile_photo_url}
                    alt={review.author_name}
                  />
                  <div className="review-info">
                    <a
                      href={review.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="author-name"
                    >
                      {review.author_name}
                    </a>
                    <Rating value={review.rating} readOnly size="medium" />
                    <p className="review-date">
                      {review.relative_time_description}
                    </p>
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        {/* <div className="embla__buttons"> */}
          <PrevButton
            onClick={() => {
              stopAutoplay();
              onPrevButtonClick();
            }}
            disabled={prevBtnDisabled}
          />
          <NextButton
            onClick={() => {
              stopAutoplay();
              onNextButtonClick();
            }}
            disabled={nextBtnDisabled}
          />
        {/* </div> */}
        {/* <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => {
                stopAutoplay();
                onDotButtonClick(index);
              }}
              className={`embla__dot${
                index === selectedIndex ? " embla__dot--selected" : ""
              }`}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default EmblaCarousel;
