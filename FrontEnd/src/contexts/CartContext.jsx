import React, { createContext, useReducer } from "react";

// Initializes the cart state with an empty array.
const initialState = { cart: [] };

// Reducer function to manage cart actions like adding, removing, and updating item quantities.
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.cart.find(
        (item) => item.ID === action.payload.ID
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.ID === action.payload.ID
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cart: [...state.cart, { ...action.payload, quantity: 1 }],
        };
      }
      
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item, index) => index !== action.payload),
      };
    case "INCREMENT_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.ID === action.payload.ID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    case "DECREMENT_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.ID === action.payload.ID
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        ),
      };
    case "UPDATE_CART":
      return {
        ...state,
        cart: action.payload, // Update cart with new items
      };
    case "CLEAR_CART":
      return {
        ...state,
        cart: [], // Clear the cart
      };
    default:
      return state;
  }
   
};

// Creates a context for the cart to be used throughout the application.
export const CartContext = createContext();

// Provides the cart state and dispatch function to its children components.
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={{ cart: state.cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
