import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "../src/contexts/session/AuthContext ";
import AutoLogout from "../src/contexts/session/AutoLogout"; // Ensure this is the correct path
// import './index.css'
import { TruckLocationProvider } from "./contexts/TruckLocationContext";
import { SearchProvider } from "./contexts/SearchContext";
// ReactDOM.createRoot: Initializes the React application and attaches it to the DOM element with the ID "root".
// root.render: Renders the application wrapped in context providers for cart and authentication, ensuring proper state management.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AutoLogout>
          <TruckLocationProvider>
            <SearchProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </SearchProvider>
          </TruckLocationProvider>
        </AutoLogout>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
