import React from "react";
import { Line } from "react-chartjs-2";
import styles from "./OrderGraphModal.module.css";

// This component displays a modal with a line graph of order prices over time.
// It receives props to control visibility and data for rendering the graph.

const OrderGraphModal = ({ show, onClose, orders }) => {
  // Returns null if the modal should not be shown.
  if (!show) {
    return null;
  }

  // Extracts order dates and prices from the orders array.
  const orderDates = orders.map((order) =>
    new Date(order.date).toLocaleDateString()
  );
  const orderPrices = orders.map((order) => parseFloat(order.detailed_price));

  // Prepares the data structure for the line chart.
  const data = {
    labels: orderDates,
    datasets: [
      {
        label: "Order Prices",
        data: orderPrices,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        // Renders a close button and the line chart within the modal.
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
        <h2>Order Prices Over Time</h2>
        <Line data={data} />
      </div>
    </div>
  );
};

export default OrderGraphModal;
