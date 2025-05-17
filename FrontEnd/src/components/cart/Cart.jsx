import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../contexts/CartContext";
import axios from "axios";
import classes from "./cart.module.css";
import CheckoutModal from "../CheckoutModal/CheckoutModal";

const Cart = () => {
  const { cart = [], dispatch } = useContext(CartContext); // Ensure cart is always an array
  const [showModal, setShowModal] = useState(false); // State to control the visibility of the checkout modal
  const [globalDiscount, setGlobalDiscount] = useState(0); // State to hold the global discount value
  const [taxVal, setTaxVal] = useState(0.0); // State to hold the tax value (currently unused)

  useEffect(() => {
    // Fetch global discount
    const fetchGlobalDiscount = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/settings/global_discount"
        );
        setGlobalDiscount(parseFloat(response.data.value) || 0); // Set global discount from API response
      } catch (error) {
        console.error("Error fetching global discount:", error); // Log error if fetching fails
      }
    };

    fetchGlobalDiscount(); // Call function to fetch global discount
  }, []);

  const getDiscountedPrice = (price, itemDiscount) => {
    let finalPrice = price; // Initialize final price with the original price

    // Apply individual item discount if it exists
    if (itemDiscount && itemDiscount > 0) {
      finalPrice = finalPrice * (1 - itemDiscount / 100); // Calculate discounted price
    }

    // Apply global discount
    if (globalDiscount > 0) {
      finalPrice = finalPrice * (1 - globalDiscount / 100); // Adjust final price with global discount
    }

    return finalPrice; // Return the final discounted price
  };

  const handleCheckout = () => {


    const updatedCartItems = cart.map((item) => {
      const updatedPrice = getDiscountedPrice(
        parseFloat(item.price),
        item.discount
      ).toFixed(2); // Get discounted price for the main item

      const updatedExtras =
        item.extras?.map((extra) => {
          const updatedExtraPrice = getDiscountedPrice(
            parseFloat(extra.price),
            extra.discount
          ).toFixed(2);
          return { ...extra, price: updatedExtraPrice };
        }) || [];

      return { ...item, price: updatedPrice, extras: updatedExtras };
    });

    // dispatch({ type: "UPDATE_CART", payload: updatedCartItems });
    console.log("Updated Cart Items for Checkout:", updatedCartItems);
    setShowModal(true); // Show the checkout modal with updated cart prices
  };

  const handleCloseModal = () => {
    setShowModal(false); // Hide the checkout modal
  };

  const removeFromCart = (index) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: index }); // Dispatch action to remove item from cart
  };

  const incrementQuantity = (item) => {
    dispatch({ type: "INCREMENT_QUANTITY", payload: item }); // Dispatch action to increment item quantity
  };

  const decrementQuantity = (item) => {
    dispatch({ type: "DECREMENT_QUANTITY", payload: item }); // Dispatch action to decrement item quantity
  };

  const calculateSubtotal = () => {
    if (!cart || cart.length === 0) return "0.00"; // Return zero if cart is empty

    // Create a new cart array with updated values
    const updatedCart = cart.map((item) => {
      const itemBasePrice = getDiscountedPrice(
        parseFloat(item.price),
        item.discount
      ); // Get discounted price for the item

      const extrasTotal = item.extras
        ? item.extras.reduce((extTotal, ext) => {
            const extraPrice = getDiscountedPrice(
              parseFloat(ext.price || 0),
              ext.discount
            ); // Get discounted price for each extra
            return extTotal + extraPrice; // Sum up the total extras price
          }, 0)
        : 0;

      const updatedItemTotalPrice =
        (itemBasePrice + extrasTotal) * (item.quantity || 1); // Calculate total price for the item

      return {
        ...item,
        totalPrice: updatedItemTotalPrice.toFixed(2), // Save the updated total price
      };
    });

    // Calculate the overall subtotal from updatedCart
    const subtotal = updatedCart
      .reduce((total, item) => {
        return total + parseFloat(item.totalPrice || 0); // Accumulate total price
      }, 0)
      .toFixed(2); // Return total price formatted to two decimal places

    return subtotal; // Return the subtotal
  };

  console.log("Cart items:", cart); // For debugging

  return (
    <div className={classes.cartPage}>
      <h1 className={classes.header}>Your Cart Items</h1>
      <div className={classes.cartItems}>
        {cart.map((item, index) => {
          const itemBasePrice = getDiscountedPrice(
            parseFloat(item.price),
            item.discount
          ); // Get discounted price for the item

          const extrasTotal = item.extras
            ? item.extras.reduce((extTotal, ext) => {
                const extraPrice = getDiscountedPrice(
                  parseFloat(ext.price || 0),
                  ext.discount
                ); // Get discounted price for each extra
                return extTotal + extraPrice; // Sum up the total extras price
              }, 0)
            : 0;

          const itemTotalPrice = (itemBasePrice + extrasTotal).toFixed(2); // Calculate total price for the item

          return (
            <div key={index} className={classes.cartItem}>
              <img
                src={item.img}
                alt={item.name}
                className={classes.cartImage}
              />
              <div className={classes.cartInfo}>
                <h2 className={classes.subheader}>{item.name}</h2>
                <p className={classes.bodyText}>{item.description}</p>
                <p className={classes.bodyText}>Allergies: {item.allergies}</p>
                <p className={classes.bodyText}>
                  Price per Item: ₪{itemTotalPrice}
                </p>
                <h3 className={classes.subheader}>Extras:</h3>
                <ul>
                  {item.extras &&
                    item.extras.map((extra, idx) => {
                      const originalPrice = parseFloat(extra.price).toFixed(2); // Get original price of extra
                      const discountedPrice = getDiscountedPrice(
                        parseFloat(extra.price),
                        extra.discount
                      ).toFixed(2); // Get discounted price of extra

                      return (
                        <li key={idx} className={classes.bodyText}>
                          {extra.name} - {extra.quantity} {extra.unit} -{" "}
                          {extra.discount > 0 || globalDiscount > 0 ? (
                            <>
                              <span style={{ textDecoration: "line-through" }}>
                                ₪{originalPrice}
                              </span>{" "}
                              <span>₪{discountedPrice}</span>
                            </>
                          ) : (
                            <span>₪{originalPrice}</span>
                          )}
                        </li>
                      );
                    })}
                </ul>
                <div className={classes.quantityControl}>
                  <button onClick={() => decrementQuantity(item)}>-</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => incrementQuantity(item)}>+</button>
                </div>
                <button
                  onClick={() => removeFromCart(index)}
                  className={classes.removeButton}
                >
                  Remove from Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className={classes.subtotal}>
        <h3 className={classes.subheader}>Subtotal: ₪{calculateSubtotal()}</h3>
      </div>
      {cart.length > 0 && (
        <button onClick={handleCheckout} className={classes.checkoutButton}>
          Check Out
        </button>
      )}
      {showModal && (
        <CheckoutModal
          onClose={handleCloseModal}
          cartItems={cart} // Update price for modal
        />
      )}
    </div>
  );
};

export default Cart;
