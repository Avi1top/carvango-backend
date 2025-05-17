import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import classes from "./footer.module.css";
import logo from "../../assets/imgs/logologo.png";
import { SiGooglemaps, SiWaze } from "react-icons/si";
import { TruckLocationContext } from "../../contexts/TruckLocationContext";
import loader from "../findTruck/googleMapsLoader"; // Import the Google Maps loader
import { FaInstagram, FaFacebookSquare, FaTimes } from "react-icons/fa"; // Import icons

export default function Footer() {
  const { truckLocations } = useContext(TruckLocationContext);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      await loader.load(); // Ensure the Google Maps API is loaded
      const google = window.google;

      if (google && google.maps) {
        const geocoder = new google.maps.Geocoder();
        let fetchedAddresses = [];

        for (const location of truckLocations) {
          try {
            const response = await geocoder.geocode({ location });
            if (response && response.results[0]) {
              fetchedAddresses.push({
                address: response.results[0].formatted_address,
                location,
              });
            }
          } catch (error) {
            console.error("Geocoder failed due to: ", error);
          }
        }

        setAddresses(fetchedAddresses); // Update addresses state
      } else {
        // Fallback to local storage if Google Maps API is not available
        const storedAddresses = localStorage.getItem("truckAddresses");
        if (storedAddresses) {
          setAddresses(JSON.parse(storedAddresses));
        }
      }
    };

    fetchAddresses();
  }, [truckLocations]);

  return (
    <footer className={classes.Footer}>
      <div className={classes.FooterContent}>
        {/* Logo Section */}
        <div className={classes.LogoSection}>
          <img src={logo} alt="alwadiFlafel Logo" className={classes.Logo} />
        </div>

        {/* Quick Links */}
        <div className={classes.QuickLinks}>
          <h4 className={classes.SectionTitle}>Quick Links</h4>
          <ul className={classes.List}>
            <li>
              <Link to="/menu" className={classes.Link}>
                Our Menu
              </Link>
            </li>
            <li>
              <Link to="/find-truck" className={classes.Link}>
                Find The Truck
              </Link>
            </li>
            <li>
              <Link to="/bookTruck" className={classes.Link}>
                Book The Truck
              </Link>
            </li>
            <li>
              <Link to="/catering" className={classes.Link}>
                Catering
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={classes.ContactInfo}>
          <h4 className={classes.SectionTitle}>Contact Info</h4>
          <p className={classes.Info}>📞 615-713-2888</p>
          <Link to={"mailto:alwadiflafel@gmail"} className={classes.Info}>
            📧 alwadiflafel@gmail.com
          </Link>
          <ul>
            {addresses.filter((item) => item.location.isActive).map((item, index) => (
              <li key={index}>
                <Link to="/find-truck" className={classes.Link}>
                  📍 {item.address}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        
        <div className={classes.SocialMediaIcons}>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className={classes.IconLink}
        >
          <FaInstagram /> Instagram
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className={classes.IconLink}
        >
          <FaFacebookSquare /> Facebook
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className={classes.IconLink}
        >
          <FaTimes /> Twitter
        </a>
      </div>
      </div>
      <p className={classes.Info}>
        &copy; {new Date().getFullYear()} Alwadi Flafel. All Rights Reserved.
        <p className={classes.Info}>Website Design By George and Abrahem.</p>
      </p>
    </footer>
  );
}
