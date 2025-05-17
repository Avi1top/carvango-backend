import { Loader } from "@googlemaps/js-api-loader";

// options: Configuration object for the Google Maps API loader, including API key and libraries.
const options = {
  apiKey: "AIzaSyCwvFKsi2ciiASnWMY_H6IHuX-e_0bwBUY",
  version: "weekly",
  libraries: ["places", "geocoding", "marker"], // Ensure the required libraries are loaded
};

// loader: Initializes the Google Maps API loader with the specified options.
const loader = new Loader(options);

export default loader;
