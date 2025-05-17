import React, { useState, useEffect } from "react";
import axios from "axios";

const GlobalDiscount = () => {
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchDiscount();
  }, []);

  // Fetches the current global discount from the server and updates the discount state.
  const fetchDiscount = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/settings/global_discount"
      );
      setDiscount(response.data.value || 0);
    } catch (error) {
      console.error("Error fetching global discount:", error);
    }
  };

  // Updates the discount state based on user input from the input field.
  const handleDiscountChange = (e) => {
    setDiscount(e.target.value);
  };

  // Sends the updated global discount value to the server and alerts the user upon success.
  const saveDiscount = async () => {
    try {
      await axios.post("http://localhost:3001/settings/global_discount", {
        value: discount,
      });
      alert("Global discount updated");
    } catch (error) {
      console.error("Error saving global discount:", error);
    }
  };

  // Renders the component, including the input for the discount and the save button.
  return (
    <div>
      <h3>Set Global Discount</h3>
      <input
        type="number"
        value={discount}
        onChange={handleDiscountChange}
        min="0"
        max="100"
        step="0.01"
        style={{ fontSize: '16px', padding: '2px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' }}
      />
      <button onClick={saveDiscount} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '8px 16px', transition: 'background-color 0.3s ease', marginLeft: '10px' }}>Save Discount</button>
    </div>
  );
};

export default GlobalDiscount;
