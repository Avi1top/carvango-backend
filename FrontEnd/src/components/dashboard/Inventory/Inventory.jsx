// // src/components/dashboard/inventory/Inventory.jsx
// import React, { useState } from "react";
// import Extras from "./Extras/Extras";
// import Dishes from "./Dishes/Dishes";
// import classes from "./Inventory.module.css";
// import { useNavigate } from "react-router-dom";

// const Inventory = () => {
//   const [view, setView] = useState("");
//   const navigate = useNavigate();

//   const handleViewChange = (newView) => {
//     setView(newView);
//   };

//   const goToIngredients = () => {
//     navigate("/ingredients");
//   };

//   return (
//     <div className={classes.inventoryPage}>
//       <div className={classes.mainContent}>
//         {view === "" ? (
//           <div className={classes.buttonsContainer}>
//             <button onClick={() => handleViewChange("extras")}>Extras</button>
//             <button onClick={() => handleViewChange("dishes")}>Dishes</button>
//             <button onClick={goToIngredients}>Ingredients</button>{" "}
//           </div>
//         ) : (
//           <div className={classes.content}>
//             <button
//               onClick={() => handleViewChange("")}
//               className={classes.backButton}
//             >
//               Back
//             </button>
//             {view === "extras" && <Extras />}
//             {view === "dishes" && <Dishes />}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Inventory;
