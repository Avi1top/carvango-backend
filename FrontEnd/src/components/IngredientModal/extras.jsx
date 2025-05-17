import React, { useState, useEffect } from "react";
import axios from "axios";
import classes from "./extras.module.css";

const ExtrasModal = ({ meal, onAdd, onClose }) => {
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [mealPrice, setMealPrice] = useState(0); // To store the discounted meal price
  const [totalPrice, setTotalPrice] = useState(0); // To store the overall total price (meal + extras)

  // getDiscountedPrice calculates the final price of an item after applying
  // individual and global discounts, if applicable.
  const getDiscountedPrice = (price, itemDiscount) => {
    let finalPrice = price;

    // Apply individual item discount if it exists
    if (itemDiscount && itemDiscount > 0) {
      finalPrice = finalPrice * (1 - itemDiscount / 100);
    }

    // Apply global discount
    if (globalDiscount > 0) {
      finalPrice = finalPrice * (1 - globalDiscount / 100);
    }

    return finalPrice;
  };

  // Fetch global discount and extras
  useEffect(() => {
    const fetchGlobalDiscountAndExtras = async () => {
      try {
        const discountResponse = await axios.get(
          "http://localhost:3001/settings/global_discount"
        );
        const fetchedGlobalDiscount =
          parseFloat(discountResponse.data.value) || 0;

        setGlobalDiscount(fetchedGlobalDiscount);

        // Fetch extras
        const extrasResponse = await axios.get(
          "http://localhost:3001/extras/menu"
        );
        setExtras(extrasResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchGlobalDiscountAndExtras();
  }, []);

  // Recalculate meal price whenever global discount or meal changes
  useEffect(() => {
    const updatedMealPrice = getDiscountedPrice(
      parseFloat(meal.price),
      meal.discount
    );
    setMealPrice(updatedMealPrice);
  }, [meal.price, meal.discount, globalDiscount]);

  // Recalculate total price whenever selected extras, meal price or global discount changes
  useEffect(() => {
    const extrasTotal = selectedExtras.reduce((total, extra) => {
      return (
        total + getDiscountedPrice(parseFloat(extra.price), extra.discount)
      );
    }, 0);

    setTotalPrice(mealPrice + extrasTotal); // Combine meal price and selected extras prices
  }, [mealPrice, selectedExtras]);

  // handleExtraChange updates the selected extras and recalculates the total price
  const handleExtraChange = (extra) => {
    const extraPrice = getDiscountedPrice(
      parseFloat(extra.price),
      extra.discount
    );
    let newSelectedExtras;

    if (selectedExtras.some((ex) => ex.ID === extra.ID)) {
      newSelectedExtras = selectedExtras.filter((ex) => ex.ID !== extra.ID);
    } else {
      newSelectedExtras = [...selectedExtras, extra];
    }

    setSelectedExtras(newSelectedExtras);
  };

  // handleAdd prepares the updated meal object with selected extras and triggers
  // the onAdd callback to add the meal to the cart.
  const handleAdd = () => {
    const updatedMeal = {
      ...meal,
      extras: selectedExtras,
    };
    onAdd(updatedMeal);
  };

  return (
    <div className={classes.modalOverlay}>
      <div className={classes.modalContent}>
        <h2>Add extras to the {meal.name}</h2>
        <ul className={classes.extrasList}>
          {extras.map((extra) => {
            const originalPrice = parseFloat(extra.price).toFixed(2);
            const discountedPrice = getDiscountedPrice(
              parseFloat(extra.price),
              extra.discount
            ).toFixed(2);

            return (
              <li key={extra.ID}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedExtras.some((ex) => ex.ID === extra.ID)}
                    onChange={() => handleExtraChange(extra)}
                  />
                  {extra.name} -{" "}
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
                </label>
              </li>
            );
          })}
        </ul>
        <div className={classes.modalFooter}>
          <p style={{ color: "red" }}>Total Price: ₪{parseFloat(totalPrice).toFixed(2)}</p>
          <button onClick={handleAdd} className={classes.Button}>
            Add to Cart
          </button>
          <button onClick={onClose} className={classes.Button}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtrasModal;
