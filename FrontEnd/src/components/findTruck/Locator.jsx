import React, { useEffect, useContext } from "react";
import classes from "./findTruck.module.css";
import { TruckLocationContext } from "../../contexts/TruckLocationContext";

const Locator = () => {
  const { truckLocation } = useContext(TruckLocationContext);

  useEffect(() => {
    const loadScript = (src) => { 
      // Creates and appends a script element to the document for loading external scripts.
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "module";
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadExtendedComponentLibrary = async () => { 
      // Loads the Google Maps extended component library and configures the locator.
      await loadScript(
        "https://unpkg.com/@googlemaps/extended-component-library@0.6"
      );
      configureLocator();
    };

    const configureLocator = () => { 
      // Sets up the configuration for the store locator with location and map options.
      const CONFIGURATION = {
        locations: [
          {
            title: "Food Truck Location",
            address1: "123 Main St",
            address2: "Anytown, USA",
            coords: { lat: truckLocation.lat, lng: truckLocation.lng },
          },
        ],
        mapOptions: {
          center: { lat: truckLocation.lat, lng: truckLocation.lng },
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoom: 12,
          zoomControl: true,
          maxZoom: 17,
          mapId: "ca6a4574fe78acbc",
        },
        mapsApiKey: "AIzaSyCwvFKsi2ciiASnWMY_H6IHuX-e_0bwBUY",
        capabilities: {
          input: true,
          autocomplete: true,
          directions: true,
          distanceMatrix: true,
          details: true,
          actions: true,
        },
      };

      document.addEventListener("DOMContentLoaded", async () => {
        await customElements.whenDefined("gmpx-store-locator");
        const locator = document.querySelector("gmpx-store-locator");
        locator.configureFromQuickBuilder(CONFIGURATION);
      });
    };

    loadExtendedComponentLibrary();

    // Clean up scripts on component unmount
    return () => {
      const scripts = document.querySelectorAll(
        "script[src='https://unpkg.com/@googlemaps/extended-component-library@0.6']"
      );
      scripts.forEach((script) => script.remove());
    };
  }, [truckLocation]);

  return (
    <div className={classes.main}>
      <div style={{ width: "100%", height: "400px" }}>
        <gmpx-api-loader
          api-key="AIzaSyCwvFKsi2ciiASnWMY_H6IHuX-e_0bwBUY"
          solution-channel="GMP_QB_locatorplus_v10_cABD"
        ></gmpx-api-loader>
        <gmpx-store-locator map-id="ca6a4574fe78acbc"></gmpx-store-locator>
      </div>
    </div>
  );
};

export default Locator;
