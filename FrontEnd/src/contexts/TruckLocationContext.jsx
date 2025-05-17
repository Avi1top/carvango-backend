import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios"; // Import axios for API calls

export const TruckLocationContext = createContext();

export const TruckLocationProvider = ({ children }) => {
  const [truckLocations, setTruckLocations] = useState([]);
  const [updateCount, setUpdateCount] = useState(0); // State to force re-renders

  // Fetch truck locations from the database on initial load and when updateCount changes
  const fetchTruckLocations = useCallback(async () => {
    try {
      const response = await axios.get("/maps/getTruckLocations");
      console.log("Fetched truck locations:", response.data);
      if (Array.isArray(response.data)) {
        const formattedLocations = response.data.map((location) => ({
          id: location.id,
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
          name: location.name,
          isActive: location.isActive,
          address: location.address,
        }));
        setTruckLocations(formattedLocations);
        console.log("Formatted locations:", formattedLocations);
      } else {
        console.error("Fetched data is not an array:", response.data);
      }
    } catch (error) {
      console.error("Error fetching truck locations:", error);
    }
  }, []);

  useEffect(() => {
    fetchTruckLocations();
  }, [fetchTruckLocations, updateCount]); // Re-fetch on `updateCount` change

  // Function to trigger a re-render by updating `updateCount`
  const triggerRerender = () => setUpdateCount((count) => count + 1);

  return (
    <TruckLocationContext.Provider
      value={{ truckLocations, setTruckLocations, triggerRerender }}
    >
      {children}
    </TruckLocationContext.Provider>
  );
};
