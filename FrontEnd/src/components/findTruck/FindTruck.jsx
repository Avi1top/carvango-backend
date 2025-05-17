import React, { useEffect, useRef, useContext, useState } from "react";
import classes from "./findTruck.module.css";
import { TruckLocationContext } from "../../contexts/TruckLocationContext";
import loader from "./googleMapsLoader";
import { SiGooglemaps, SiWaze } from "react-icons/si";
import ReactDOMServer from "react-dom/server";
import axios from "axios"; // Add axios import

const containerStyle = {
  width: "100%",
  height: "400px",
};

const FindTruck = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstances = useRef([]);
  const infowindowInstance = useRef(null);
  const { truckLocations, setTruckLocations } =
    useContext(TruckLocationContext);
  const [addresses, setAddresses] = useState([]);
  const [isWithinWorkHours, setIsWithinWorkHours] = useState(true);
  const [workHours, setWorkHours] = useState({});
  const [isClosed, setIsClosed] = useState(false);
  const [nextOpening, setNextOpening] = useState("");

  useEffect(() => {
    const initializeMap = async () => {
      await loader.load();
      const google = window.google;

      if (mapRef.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 }, // Temporary center
          zoom: 2, // Temporary zoom
          mapId: "ca6a4574fe78acbc",
        });

        infowindowInstance.current = new google.maps.InfoWindow();
        const geocoder = new google.maps.Geocoder();
        const bounds = new google.maps.LatLngBounds();
        const fetchedAddresses = [];

        try {
          truckLocations
            .filter((location) => location.isActive)
            .forEach((location, index) => {
              const pin = new google.maps.marker.PinElement();
              const marker = new google.maps.marker.AdvancedMarkerElement({
                position: location,
                map: mapInstance.current,
                content: pin.element,
              });
              markerInstances.current.push(marker);
              bounds.extend(location);

              geocoder.geocode({ location }, (results, status) => {
                if (status === "OK" && results[0]) {
                  fetchedAddresses.push({
                    address: results[0].formatted_address,
                    location,
                  });
                  setAddresses([...fetchedAddresses]);

                  marker.addListener("click", () => {
                    const address = results[0].formatted_address;
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
                    const wazeUrl = `https://waze.com/ul?ll=${location.lat},${location.lng}&navigate=yes`;
                    const googleMapsIcon = ReactDOMServer.renderToString(
                      <SiGooglemaps />
                    );
                    const wazeIcon = ReactDOMServer.renderToString(<SiWaze />);
                    infowindowInstance.current.setContent(`
                    <div class="${classes.infowindowContent}">
                      <h3 class="${classes.infowindowTitle}">Food Truck Location</h3>
                      <p class="${classes.infowindowAddress}">${address}</p>
                      <div class="${classes.infowindowButtons}">
                        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">
                          <button class="${classes.button} ${classes.buttonPrimary}">
                            ${googleMapsIcon} Google Maps
                          </button>
                        </a>
                        <a href="${wazeUrl}" target="_blank" rel="noopener noreferrer">
                          <button class="${classes.button} ${classes.buttonPrimary}">
                            ${wazeIcon} Waze
                          </button>
                        </a>
                      </div>
                    </div>
                  `);
                    infowindowInstance.current.open(
                      mapInstance.current,
                      marker
                    );
                  });
                } else {
                  console.error("Geocoder failed due to: " + status);
                }
              });
            });

          mapInstance.current.fitBounds(bounds);
        } catch (error) {
          console.error("Error fetching truck locations:", error);
        }
      }
    };

    // Call initializeMap to set up the map with truck locations
    initializeMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [truckLocations]);

  // checkWorkHours: Fetches the work hours from the server and checks if the truck is currently open or closed.
  useEffect(() => {
    const checkWorkHours = async () => {
      try {
        const response = await axios.get("/api/getWorkHours");
        setWorkHours(response.data);
        checkIfClosed(response.data);
      } catch (error) {
        console.error("Error fetching work hours:", error);
      }
    };
    const checkIfClosed = (hours) => {
      const today = new Date();
      const currentDay = today.toLocaleDateString("en-US", { weekday: "long" });
      const currentTime = today.toTimeString().slice(0, 5); // HH:MM format

      if (hours[currentDay]) {
        const { startHour, endHour, isOpen } = hours[currentDay];

        if (!isOpen || currentTime < startHour || currentTime > endHour) {
          setIsClosed(true);
          if (currentTime < startHour && isOpen) {
            setNextOpening(`Today at ${startHour}`);
          } else {
            setNextOpening(findNextOpening(hours, currentDay));
          }
        } else {
          setIsClosed(false);
        }
      }
    };

    // findNextOpening: Finds the next opening time for the truck based on the current day and work hours.
    const findNextOpening = (hours, currentDay) => {
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      let nextDayIndex = daysOfWeek.indexOf(currentDay) + 1;

      for (let i = 0; i < 7; i++) {
        const day = daysOfWeek[nextDayIndex % 7];
        if (hours[day] && hours[day].isOpen) {
          return `${day} at ${hours[day].startHour}`;
        }
        nextDayIndex++;
      }
      return "No upcoming opening hours";
    };

    // Call checkWorkHours to set initial state
    checkWorkHours();
  }, []);
  return (
    <div className={classes.main}>
      {/* Display opening hours information */}
      {isClosed ? (
        <div className={classes.header}>
          <h2 className={classes.heading}>
            The food truck is currently Closed
          </h2>
          <p className={classes.hours}>We will open next on: {nextOpening}</p>
        </div>
      ) : (
        <div className={classes.header}>
          <h2 className={classes.heading}>The Food Truck is Currently Open</h2>
        </div>
      )}
      <div ref={mapRef} style={containerStyle} id="map" />
      <div className={classes.addressList}>
        <h3>Truck Locations</h3>
        <ul>
          {addresses.map((item, index) => (
            <li key={index}>
              <p>{item.address}</p>
              <div className={classes.buttonGroup}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${item.location.lat},${item.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    className={`${classes.button} ${classes.buttonPrimary}`}
                  >
                    <SiGooglemaps /> Google Maps
                  </button>
                </a>
                <a
                  href={`https://waze.com/ul?ll=${item.location.lat},${item.location.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button
                    className={`${classes.button} ${classes.buttonPrimary}`}
                  >
                    <SiWaze /> Waze
                  </button>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FindTruck;
