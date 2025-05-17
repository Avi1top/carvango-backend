import classes from "./main.module.css";
import mainImage from "../../assets/imgs/cover.jpg";
import aboutUs from "../../assets/imgs/about.JPG";
import debounce from "lodash.debounce";

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/session/AuthContext "; // Import AuthContext
import EmblaCarousel from "../reviews/carousel/EmblaCarousel";

/**
 * Main component renders the main content of the application,
 * including a title and a description about the service offered.
 */
export default function Main() {
  const { isAuthenticated } = useContext(AuthContext); // Use AuthContext

  const [paragraph, setParagraph] = useState("");
  const [editParagraph, setEditParagraph] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false); // State for main image visibility

  // Function to fetch the main paragraph
  useEffect(() => {
    const fetchData = async () => {
      try {
        axios
          .get("/main")
          .then((response) => {
            setParagraph(response.data.value);
          })
          .catch((error) => {
            console.error("Error fetching main paragraph:", error);
          });
      } catch (error) {
        console.error("Error fetching main paragraph:", error);
      }
    };
    fetchData();
  }, [paragraph]);
  // Function to update the main paragraph
  const handleParagraphChange = async (value) => {
    try {
      axios
        .put("/main", { value: value })
        .then((response) => {
          setParagraph(response.data.value);
        })
        .catch((error) => {
          console.error("Error updating main paragraph:", error);
        });
    } catch (error) {
      console.error("Error updating main paragraph:", error);
    }
  };
  const OPTIONS = { loop: true };
  const SLIDE_COUNT = 5;
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

  // Scroll event handler
  const handleScroll = debounce(() => {
    const aboutUsElement = document.querySelector(`.${classes.aboutUs}`);
    if (aboutUsElement) {
      const rect = aboutUsElement.getBoundingClientRect();
      console.log("Bounding rect:", rect); // Debugging
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        console.log("Element is in view!"); // Debugging
        setIsVisible(true);
        window.removeEventListener("scroll", debouncedScrollHandler);
      }
    }
  }, 100); // Adjust debounce delay as needed

  const debouncedScrollHandler = handleScroll;

  useEffect(() => {
    window.addEventListener("scroll", debouncedScrollHandler);
    return () => {
      window.removeEventListener("scroll", debouncedScrollHandler);
    };
  }, []);
  // Trigger the jumping effect on load
  useEffect(() => {
    setIsImageVisible(true); // Set main image to visible on load
  }, []);
  return (
    <main className={classes.main}>
      <div className={classes.title}>
        <h1>Alwadi Flafel</h1>
      </div>
      {isAuthenticated && (
        <div className={classes.textarea}>
          <textarea
            type="text"
            name="paragraph"
            value={editParagraph}
            onChange={(e) => setEditParagraph(e.target.value)}
            placeholder="Edit your paragraph here"
          />
          <button onClick={() => handleParagraphChange(editParagraph)}>
            Submit
          </button>
        </div>
      )}
      <div className={classes.mainSection}>
        <div
          className={`${classes.jump} ${isImageVisible ? classes.visible : ""}`}
        >
          <img src={mainImage} alt="Main image" className={classes.mainImage} />
          <div className={classes.reviews}></div>
        </div>
        <EmblaCarousel options={{ loop: true }} />
        <div className={classes.aboutUsSection}>
          <img
            src={aboutUs}
            alt="aboutUs image"
            className={`${classes.aboutUs} ${isVisible ? classes.visible : ""}`}
          />
          <div
            className={`${classes.paragraph} ${
              isVisible ? classes.visible : ""
            }`}
          >
            <p>{paragraph}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
