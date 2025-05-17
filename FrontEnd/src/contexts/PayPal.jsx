import React, { useEffect, useState, useContext } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { CartContext } from "../contexts/CartContext";

// Paypal component handles PayPal payment processing and order creation.
const Paypal = ({
  email,
  phoneNum,
  cartItems,
  onPaymentSuccess,
  deliveryOption,
}) => {
  console.log("Cart items paypal:", cartItems);
  const initialOptions = {
    "client-id":
      "AZFXM0DCrLWBtK-lhTaO0KXxaVPt9gfD12-leYNpSFeV7lks92hL3_OMsxSzG6bvKhOFmOEcplooZqgj",
    currency: "ILS",
    intent: "capture",
  };
  const { dispatch } = useContext(CartContext); // Ensure cart is always an array
  const [taxVal, setTaxVal] = useState(0.0);
  const [isLoadingTax, setIsLoadingTax] = useState(true); // Track loading state for tax
  const [globalDiscount, setGlobalDiscount] = useState(0); // State to hold the global discount value

  // Fetches tax value from the server and updates the state.
  useEffect(() => {
    const getTax = async () => {
      try {
        const response = await axios.get("http://localhost:3001/tax");
        setTaxVal(Number(response.data.value));
        console.log("Fetched tax (before state update):", response.data.value);
      } catch (error) {
        console.error("Error fetching tax:", error);
      } finally {
        setIsLoadingTax(false); // Set loading to false whether success or error
      }
    };
    getTax();
  }, []);

  // Logs the updated tax value after it has been set.
  // useEffect(() => {
  //   const updateCart = () => {
  //     const updatedCartItems = cartItems.map((item) => {
  //       const updatedPrice = getDiscountedPrice(
  //         parseFloat(item.price),
  //         item.discount
  //       ).toFixed(2); // Get discounted price for the main item

  //       const updatedExtras =
  //         item.extras?.map((extra) => {
  //           const updatedExtraPrice = getDiscountedPrice(
  //             parseFloat(extra.price),
  //             extra.discount
  //           ).toFixed(2);
  //           return { ...extra, price: updatedExtraPrice };
  //         }) || [];

  //       return { ...item, price: updatedPrice, extras: updatedExtras };
  //     });

  //     dispatch({ type: "UPDATE_CART", payload: updatedCartItems });
  //     console.log("Updated Cart Items after dispatch:", updatedCartItems); // Use updatedCartItems instead of cartItems here
  //   };

  //   updateCart();
  // }, [taxVal, globalDiscount]); // Add globalDiscount to the dependency array

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
console.log("globalDiscount", globalDiscount);
  const getDiscountedPrice = (price, itemDiscount) => {
    let finalPrice = price; // Initialize final price with the original price
  console.log("globalDiscount ion func", globalDiscount);

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

  useEffect(() => {
    if (globalDiscount !== null) {
      // Recalculate cart items when globalDiscount is fetched
      const updatedCartItems = cartItems.map((item) => {
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

      console.log("Updated Cart Items after global discount:", updatedCartItems);
    }
  }, [globalDiscount, cartItems]); // Dependency array includes globalDiscount and cartItems
let updatedCartItems
  const createOrder = (data, actions) => {
    console.log("cartItems in order", cartItems);
    // Ensure globalDiscount is fetched before creating the order
    if (globalDiscount === null) {
      console.error("Global discount not fetched yet");
      return;
    }

     updatedCartItems = cartItems.map((item) => {
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

    console.log("updatedCartItems", updatedCartItems);
    const subtotal = updatedCartItems.reduce((total, item) => {
      const itemTotal =
        (item.price ? item.price : 0) * (item.quantity ? item.quantity : 1);

      const extrasTotal = item.extras
        ? item.extras.reduce(
            (ingTotal, extra) =>
              ingTotal +
              (extra.price ? Number(extra.price) : 0) *
                (item.quantity ? item.quantity : 1),
            0
          )
        : 0;

      return total + itemTotal + extrasTotal;
    }, 0);

    console.log("subtotal", subtotal);

    // const tax = subtotal * taxVal; // Use the fetched tax value
    const totalAmount = subtotal.toFixed(2);
    console.log("totalAmount", totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      console.error("Invalid total amount:", totalAmount);
      throw new Error("Invalid total amount");
    }

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: totalAmount,
          },
        },
      ],
    });
  };

  // Handles successful payment approval and processes order details.
  const onApprove = async (data, actions) => {
    const details = await actions.order.capture();
    console.log("Payment details", details);

    const payer = details.payer;
    const purchaseUnit = details.purchase_units[0];

    // Extract customer details
    const name = `${payer.name.given_name} ${payer.name.surname}`;
    const customerEmail = email || "N/A";
    const phone = phoneNum || "N/A";
    const address = purchaseUnit.shipping.address;
    const fullAddress = [
      address.address_line_1,
      address.address_line_2,
      address.admin_area_2,
      address.admin_area_1,
      address.postal_code,
      address.country_code,
    ]
      .filter((part) => part && part.trim().length > 0)
      .join(", ");

      console.log("updated cart items in on approve", updatedCartItems);  
    // Calculate totals
    let subtotal = updatedCartItems.reduce((total, item) => {
      const itemTotal =
        (item.price ? item.price : 0) * (item.quantity ? item.quantity : 1);
      const extrasTotal = item.extras
        ? item.extras.reduce(
            (extraTotal, extra) =>
              extraTotal +
              (extra.price ? Number(extra.price) : 0) *
                (item.quantity ? item.quantity : 1),
            0
          )
        : 0;
      return total + itemTotal + extrasTotal;
    }, 0);
    console.log("subtotal before tax", subtotal);

     const tax = subtotal * taxVal;
     subtotal -= tax;
     const total = subtotal + tax;

    console.log("subtotal", subtotal);
    console.log("total", total);
    console.log("tax", tax);

    const orderDetails = {
      orderNumber: details.id,
      date: new Date().toISOString().split("T")[0],
      customer: {
        name: name,
        email: customerEmail,
        phone: phone,
        address: fullAddress || deliveryOption ,
      },
      items: updatedCartItems.map((item) => ({
        dishID: item.ID,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        extras: item.extras
          ? item.extras.map((extra) => ({
              extraID: extra.ID,
              name: extra.name,
              quantity: extra.quantity || 1,
              unit: extra.unit || "",
              price: extra.price || 0,
            }))
          : [],
      })),
      subtotal: subtotal,
      discounts: globalDiscount || 0,
      tax: tax,
      total: total,
      paymentMethod: "PayPal",
      transactionId: details.id,
    };

    try {
      console.log("Order paypall details:", orderDetails);
      const response = await axios.post(
        "http://localhost:3001/orders/add-order",
        orderDetails
      );
      console.log("Order created and inventory updated", response.data);
      onPaymentSuccess(orderDetails);
    } catch (error) {
      console.error("Error processing order:", error);
     if (error.response && error.response.status === 400) {
       const items = error.response.data.items || [];
       const outOfStock = error.response.data.outOfStock || [];

       console.log("Items out of stock:", items);
        alert("Some items are out of stock. sorry for the inconvenience", items);
       // Function to fetch ingredients for each item
       const fetchIngredients = async (itemId) => {
         try {
           const response = await axios.get(`/dishes/${itemId}/ingredients`);
           return response.data; // Return the ingredients data
         } catch (err) {
           console.error(`Error fetching ingredients for item ${itemId}:`, err);
           return [];
         }
       };

       // Function to check if any ingredients are out of stock
       const hasOutOfStockIngredients = (ingredients) => {
         return ingredients.some((ingredient) =>
           outOfStock.includes(ingredient.id)
         );
       };

       // Filter items with out-of-stock ingredients
       const unavailableItems = await Promise.all(
         items.map(async (item) => {
           const ingredients = await fetchIngredients(item.dishID);
           console.log("Ingredients for item", item.dishID, ":", ingredients);

           // Check if the item has out-of-stock ingredients
           if (hasOutOfStockIngredients(ingredients)) {
             return item; // Return the item if it has out-of-stock ingredients
           }
           return null; // Otherwise, return null
         })
       );

       // Filter out null values from the result
       const finalUnavailableItems = unavailableItems.filter(Boolean);

       if (finalUnavailableItems.length > 0) {
         alert(
           `We apologize, but some meals are currently unavailable due to out-of-stock ingredients: ${finalUnavailableItems
             .map((item) => item.name)
             .join(", ")}. Please review your order.`
         );
       }
     }
     else {
       alert("An error occurred. Please try again later.");
     }

    }
  };

  // Handles errors during the PayPal transaction process.
  const onError = (err) => {
    console.error("Error with PayPal transaction:", err);
    alert("An error occurred with your PayPal transaction. Please try again.");
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {isLoadingTax ? (
        <div>Loading...</div> // Display loading indicator while fetching tax
      ) : (
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
      )}
    </PayPalScriptProvider>
  );
};

export default Paypal;
