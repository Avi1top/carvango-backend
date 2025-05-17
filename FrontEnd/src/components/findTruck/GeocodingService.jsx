/* global google */

import React, { useEffect, useRef, useState, useContext } from "react";
import classes from "./Geocode.module.css";
import { TruckLocationContext } from "../../contexts/TruckLocationContext";
import {
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Button,
} from "@mui/material";
import loader from "./googleMapsLoader"; // Use shared loader
import axios from "axios";
import TruckModal from "./TruckModal ";
const GeocodingService = () => {
  const mapRef = useRef(null);
  const inputTextRef = useRef(null);
  const coordinatesRef = useRef(null);
  const [response, setResponse] = useState("");
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [geocoder, setGeocoder] = useState(null);
  const [infowindow, setInfowindow] = useState(null);
  const [error, setError] = useState("");
  const [selectedTruck, setSelectedTruck] = useState("");
  const { truckLocations, setTruckLocations } =
    useContext(TruckLocationContext);
  const [items, setItems] = useState([]); // Initial items
  const currentLocationMarker = useRef(null);
  const errorTimeoutRef = useRef(null); // Ref to store timeout
  const { triggerRerender } = useContext(TruckLocationContext);
  const [isModalOpen, setModalOpen] = useState(false);

  // useEffect to initialize the Google Map and set up markers for truck locations.
  useEffect(() => {
    const initializeMap = async () => {
      const google = window.google;
      if (!google) {
        console.error("Google Maps library not loaded");
        return;
      }

      try {
        // Import necessary libraries.
        const { AdvancedMarkerElement, PinElement } =
          await google.maps.importLibrary("marker");
        const { Geocoder } = await google.maps.importLibrary("geocoding");

        // Initialize map instance.
        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 8,
          center: { lat: -34.397, lng: 150.644 },
          mapTypeControl: false,
          mapId: "ca6a4574fe78acbc",
        });

        const geocoderInstance = new Geocoder();
        const infowindowInstance = new google.maps.InfoWindow();
        const bounds = new google.maps.LatLngBounds();

        setMap(mapInstance);
        setGeocoder(geocoderInstance);
        setInfowindow(infowindowInstance);

        // Create markers for truck locations.
        const newMarkers = truckLocations
          .filter((location) => location.isActive)
          .map((location, index) => {
            // Create the PinElement only once outside the map function
            const pin = new PinElement();
            const markerInstance = new AdvancedMarkerElement({
              map: mapInstance,
              position: location,
              title: `${truckLocations[index].name}`,
              content: pin.element,
            });

            bounds.extend(new google.maps.LatLng(location.lat, location.lng));

            // Add click event for geocoding and infowindow.
            markerInstance.addListener("click", () => {
              geocoderInstance.geocode({ location }, (results, status) => {
                if (status === "OK" && results[0]) {
                  const address = results[0].formatted_address;
                  infowindowInstance.setContent(`
                <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 300px;">
                  <h2 style="margin-bottom: 5px; font-size: 20px; color: #2c3e50;">
                    ${location.name}
                  </h2>
                  <hr style="border: 1px solid #ddd; margin: 10px 0;">
                  <h4 style="margin-bottom: 5px; font-size: 16px; color: #34495e;">
                    Location:
                  </h4>
                  <p style="margin: 0; font-size: 14px; line-height: 1.5; color: black;">
                    ${address}
                  </p>
                </div>
              `);
                  infowindowInstance.open(mapInstance, markerInstance);
                } else {
                  console.error("No results found");
                }
              });
            });

            return markerInstance;
          });

        setMarkers(newMarkers);

        // Fit map to bounds of truck locations.
        mapInstance.fitBounds(bounds);

        // Add click event to capture map clicks and perform reverse geocoding.
        mapInstance.addListener("click", (event) => {
          const clickedLocation = event.latLng;
          coordinatesRef.current.value = `${clickedLocation.lat()}, ${clickedLocation.lng()}`;
          setResponse(
            `Latitude: ${clickedLocation.lat()}, Longitude: ${clickedLocation.lng()}`
          );

          geocoderInstance.geocode(
            { location: clickedLocation },
            (results, status) => {
              if (status === "OK" && results[0]) {
                inputTextRef.current.value = results[0].formatted_address;
              } else {
                setError("Geocoder failed due to: " + status);
              }
            }
          );
        });

        // Add a button to set the first truck's location to the user's current location.
        const locationButton = document.createElement("button");
        locationButton.textContent = "📍";
        locationButton.classList.add(classes.currentLocationButton);
        locationButton.addEventListener(
          "click",
          updateFirstTruckToCurrentLocation
        );
        mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(
          locationButton
        );
      } catch (error) {
        console.error("Error initializing the map:", error);
      }
    };

    const loadScript = () => {
      loader.load().then(() => initializeMap());
    };

    loadScript();

    // Cleanup function to remove listeners and reset state on unmount.
    return () => {
      if (mapRef.current) {
        const google = window.google;
        if (google && map) {
          google.maps.event.clearInstanceListeners(map);
        }
        setMap(null);
        setMarkers([]);
        setGeocoder(null);
        setInfowindow(null);
        currentLocationMarker.current = null;
      }
    };
  }, [truckLocations]);

  const geocodeLocation = (location, callback) => {
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results[0]) {
        callback(null, results[0].formatted_address);
      } else {
        callback("Geocode failed for location: " + status, null);
      }
    });
  };

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);
  const updateLocationAndAddresses = async () => {
    if (!geocoder) {
      console.error("Geocoder is not initialized");
      return;
    }

    if (selectedTruck && coordinatesRef.current.value) {
      const [lat, lng] = coordinatesRef.current.value
        .split(",")
        .map(parseFloat);

      let newLocation = {
        lat,
        lng,
        name: selectedTruck.name,
        isActive: true,
      };

      // Update only the selected truck's location
      const updatedLocations = truckLocations.map((location) =>
        location.id === parseInt(selectedTruck.id) ? newLocation : location
      );

      console.log("Saving updated truck locations:", updatedLocations);
      localStorage.setItem("truckLocations", JSON.stringify(updatedLocations));

      try {
        // Geocode only the selected truck's new location
        const updatedAddress = await new Promise((resolve) => {
          geocodeLocation(newLocation, (error, address) => {
            if (error) {
              console.error(
                `Error geocoding location: ${selectedTruck.id}`,
                error
              );
              resolve(null); // Ensure we resolve on error
            } else {
              resolve(address); // Resolve with the new address
            }
          });
        });

        // Update the address in the updatedLocations array
        const finalUpdatedLocations = updatedLocations.map((location) =>
          location.id === parseInt(selectedTruck.id)
            ? { ...location, address: updatedAddress }
            : location
        );

        console.log(
          "Updated truck locations with new address:",
          finalUpdatedLocations
        );
        localStorage.setItem(
          "truckLocations",
          JSON.stringify(finalUpdatedLocations)
        );

        // Update only the selected marker
        await Promise.all(
          markers.map(
            (marker) =>
              new Promise((resolve) => {
                if (marker.title === selectedTruck.name) {
                  marker.position = newLocation; // Update marker position
                  const pinScaled = new google.maps.marker.PinElement({
                    scale: 1.5,
                    background: "black", // Set the fill color to black
                  });
                  marker.content = pinScaled.element;
                } else {
                  const pin = new google.maps.marker.PinElement({ scale: 1 });
                  marker.content = pin.element;
                }
                resolve(marker);
              })
          )
        );

        // Adjust the map to fit the updated bounds
        if (map) {
          const bounds = new google.maps.LatLngBounds();
          finalUpdatedLocations.forEach((location) => {
            bounds.extend(new google.maps.LatLng(location.lat, location.lng));
          });

          const padding = 20; // Example padding
          map.fitBounds(bounds, padding); // Fit the map to the bounds with padding
        } else {
          console.error("Map instance is not available");
        }

        // Add the geocoded address to the newLocation object
        newLocation = {
          ...newLocation,
          address: updatedAddress,
        };

        console.log("Sending updated truck location to API:", newLocation);
        await axios.put(
          `/maps/updateTruckLocation/${selectedTruck.id}`,
          newLocation
        );
        console.log("Truck locations updated successfully");
        triggerRerender();
        setSelectedTruck(null);
      } catch (error) {
        console.error("Error during geocoding or updating operations:", error);
      }
    } else {
      setError("Please select an item and enter coordinates.");
    }
  };


  // clear: Clears all markers from the map and resets the response and coordinates input.
  const clear = () => {
    setResponse("");
    coordinatesRef.current.value = "";
    setError("");
  };

  // geocode: Performs geocoding for a given address and updates the map and markers accordingly.
  const geocode = (request) => {
    setError(""); // Clear previous errors
    if (geocoder) {
      geocoder.geocode(request, (results, status) => {
        if (status === "OK" && results[0]) {
          map.setCenter(results[0].geometry.location);
          const pin = new google.maps.marker.PinElement();
          const newMarker = new google.maps.marker.AdvancedMarkerElement({
            position: results[0].geometry.location,
            map: map,
            title: results[0].formatted_address,
            content: pin.element,
          });
          setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
          infowindow.setContent(results[0].formatted_address || "");
          infowindow.open(map, newMarker);
          setResponse(JSON.stringify(results, null, 2));
        } else {
          setError(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    } else {
      setError("Geocoder is not initialized");
    }
  };

  // reverseGeocode: Reverses geocodes a location to get the address and updates the map and markers.
  const reverseGeocode = (request) => {
    setError(""); // Clear previous errors
    if (geocoder) {
      geocoder.geocode(request, (results, status) => {
        if (status === "OK" && results[0]) {
          map.setCenter(request.location);
          const pin = new google.maps.marker.PinElement();
          const newMarker = new google.maps.marker.AdvancedMarkerElement({
            position: request.location,
            map: map,
            title: results[0].formatted_address,
            content: pin.element,
          });
          setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
          infowindow.setContent(results[0].formatted_address || "");
          infowindow.open(map, newMarker);
          setResponse(JSON.stringify(results, null, 2));
        } else {
          setError(
            "Reverse geocode was not successful for the following reason: " +
              status
          );
        }
      });
    } else {
      setError("Geocoder is not initialized");
    }
  };

  // handleGeocode: Triggers geocoding based on user input from the text field.
  const handleGeocode = () => {
    if (inputTextRef.current.value) {
      geocode({ address: inputTextRef.current.value });
    } else {
      setError("Please enter a location.");
    }
  };

  // handleReverseGeocode: Triggers reverse geocoding based on user input from the coordinates field.
  const handleReverseGeocode = () => {
    if (coordinatesRef.current.value) {
      const latlngStr = coordinatesRef.current.value.split(",", 2);
      const latlng = {
        lat: parseFloat(latlngStr[0]),
        lng: parseFloat(latlngStr[1]),
      };
      reverseGeocode({ location: latlng });
    } else {
      setError("Please enter coordinates.");
    }
  };

  // updateFirstTruckToCurrentLocation: Updates the first truck's location to the user's current location.
  const updateFirstTruckToCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = new google.maps.LatLng(latitude, longitude);

          // Fill the coordinates input with the current location
          coordinatesRef.current.value = `${latitude}, ${longitude}`;
          setResponse(`Latitude: ${latitude}, Longitude: ${longitude}`);

          // Fill the geocode input with the current location information
          if (geocoder) {
            geocoder.geocode(
              { location: currentLocation },
              (results, status) => {
                if (status === "OK" && results[0]) {
                  inputTextRef.current.value = results[0].formatted_address;
                  // Update the address input as well
                  truckLocations[0].address = results[0].formatted_address;
                  setTruckLocations([...truckLocations]);
                } else {
                  setError("Geocoder failed due to: " + status);
                }
              }
            );
          }

          // Optionally center the map on the current location
          if (map) {
            map.setCenter(currentLocation);
          }
        },
        () => {
          setError("Unable to retrieve your location.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  // handleSelectItem: Updates the selected truck and highlights the corresponding marker on the map.
  const handleSelectItem = (e) => {
    setSelectedTruck(null);
    const selectedId = parseInt(e.target.value); // Get selected truck's ID
    try {
      const truck = truckLocations.find((t) => t.id === selectedId); // Find truck by ID
      if (truck) {
        console.log("Selected Truck:", truck);
        setSelectedTruck(truck); // Set the full truck object
        // Highlight the selected marker
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) => {
            if (marker.title === truck.name) {
              // Scale and change the pin if the marker's ID matches the truck ID
              const pinScaled = new google.maps.marker.PinElement({
                scale: 1.5,
                background: "black", // Set the fill color to black
              });
              marker.content = pinScaled.element;
            } else {
              // Default pin styling for other markers
              const pin = new google.maps.marker.PinElement({ scale: 1 });
              marker.content = pin.element;
            }
            return marker;
          })
        );
      }
    } catch (error) {
      console.error("Error selecting truck:", error);
    }
  };

  // addItem: Prompts the user to add a new item to the list and updates the state and localStorage.
  const addItem = () => {
    const newItem = prompt("Enter new item name:");
    if (newItem) {
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      localStorage.setItem("items", JSON.stringify(updatedItems));
    }
  };

  // removeItem: Removes an item from the list based on the provided index and updates the state and localStorage.
  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // clearGeocode: Clears the geocode input field and resets any error messages.
  const clearGeocode = () => {
    inputTextRef.current.value = "";
    setError("");
  };

  // Function to clear the error message after a delay
  const clearError = () => {
    setError("");
  };

  // Set a timeout to clear the error after 1.5 seconds
  useEffect(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    if (error) {
      errorTimeoutRef.current = setTimeout(clearError, 1500);
    }
  }, [error]);

  return (
    <div className={classes.container}>
      {error && <div className={classes.error}>{error}</div>}
      <div id="map" ref={mapRef} className={classes.map}></div>
      <div className={classes.controls}>
        <select
          id="truckSelect"
          value={selectedTruck?.id || ""}
          onChange={handleSelectItem}
          className={classes.select}
          required
        >
          <option value="">Select Truck</option>
          {truckLocations
            .filter((item) => item.isActive)
            .map((item, index) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
        <button
          onClick={updateLocationAndAddresses}
          className={`${classes.button} ${classes.buttonPrimary}`}
        >
          Update Location
        </button>

        <input
          ref={inputTextRef}
          type="text"
          placeholder="Enter a location"
          className={classes.inputText}
        />
        <div className={classes.buttonGroup}>
          <button
            onClick={handleGeocode}
            className={`${classes.button} ${classes.buttonPrimary}`}
          >
            Geocode
          </button>
          <button
            onClick={clearGeocode}
            className={`${classes.button} ${classes.buttonSecondary}`}
          >
            Clear Geocode
          </button>
        </div>
        <input
          type="text"
          ref={coordinatesRef}
          placeholder="Enter coordinates (lat,lng)"
          className={classes.inputText}
        />
        <div className={classes.buttonGroup}>
          <button
            onClick={handleReverseGeocode}
            className={`${classes.button} ${classes.buttonPrimary}`}
          >
            Reverse Geocode
          </button>
          <button
            onClick={clear}
            className={`${classes.button} ${classes.buttonSecondary}`}
          >
            Clear
          </button>
        </div>
      </div>
      <div>
        <Button variant="contained" size="large" onClick={handleOpen} style={{ margin: '10px', fontSize: '1.2rem' }}>
          Manage Trucks
        </Button>

        <TruckModal open={isModalOpen} handleClose={handleClose} />
      </div>
    </div>
  );
};

export default GeocodingService;
