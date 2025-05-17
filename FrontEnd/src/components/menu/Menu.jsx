import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import classes from "./menu.module.css";
import { CartContext } from "../../contexts/CartContext";
import { lazy, Suspense } from "react";
import Notification from "../Notification/Notification";
import menuHeader from "../../assets/imgs/Menu Header_pages-to-jpg-0001.jpg";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
// Lazy load the Extra component
const Extra = lazy(() => import("../IngredientModal/extras"));

const MenuPage = () => {
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [notification, setNotification] = useState("");
  const [lowStockIngredients, setLowStockIngredients] = useState([]);
  const { dispatch } = useContext(CartContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isWithinWorkHours, setIsWithinWorkHours] = useState(true);
  const [workHours, setWorkHours] = useState({});
  const [isClosed, setIsClosed] = useState(false);
  const [nextOpening, setNextOpening] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState(0);

  useEffect(() => {
    // Fetch the menu items from the server and set state
    const fetchMenu = async () => {
      try {
        const response = await axios.get("http://localhost:3001/menu");
        const mergedMeals = response.data.map((meal) => ({
          ...meal,
          img: `http://localhost:3001${meal.image_path}`,
        }));
        setMeals(mergedMeals);
        setFilteredMeals(mergedMeals);
      } catch (error) {
        setError("There was an error fetching the meals! Please try again later.");
        console.error("There was an error fetching the meals!", error);
      }
    };

    // Check if the current time is within work hours
    const checkWorkHours = async () => {
      try {
        await axios.get("/api/checkWorkHours");
        setIsWithinWorkHours(true);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setIsWithinWorkHours(false);
        } else {
          console.error("Error checking work hours", error);
        }
      }
    };

    // Fetch the global discount setting from the server
    const fetchDiscount = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/settings/global_discount"
        );
        setGlobalDiscount(parseFloat(response.data.value) || 0);
      } catch (error) {
        console.error("Error fetching global discount:", error);
      }
    };

    // Check the inventory levels for each meal and update state
    const checkInventoryLevels = async () => {
      try {
        const lowStock = [];
        for (const meal of meals) {
          const response = await axios.get(
            `http://localhost:3001/dishes/checkInventory/${meal.ID}`
          );
          if (response.data.warning) {
            lowStock.push(...response.data.message.split(", "));
            meal.isDisabled = true; // Disable the dish if ingredients are low
          } else {
            meal.isDisabled = false; // Enable the dish if ingredients are sufficient
          }
        }
        setLowStockIngredients(lowStock);
        if (lowStock.length > 0) {
          setNotification(`Low stock for: ${lowStock.join(", ")}`);
        }
        setMeals([...meals]); // Update state with modified meals
      } catch (error) {
        console.error("Error checking inventory levels", error);
      }
    };

    fetchMenu();
    checkWorkHours();
    fetchDiscount();
    checkInventoryLevels();

    // Fetch work hours and check if the restaurant is closed
    axios
      .get("/api/getWorkHours")
      .then((response) => {
        setWorkHours(response.data);
        checkIfClosed(response.data);
      })
      .catch((error) => {
        console.error("Error fetching work hours:", error);
      });
  }, []);

  // Calculate the final price after applying discounts
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

    return finalPrice.toFixed(2);
  };

  // Check if the restaurant is currently closed based on work hours
  const checkIfClosed = (hours) => {
    const today = new Date();
    const currentDay = today.toLocaleDateString("en-US", { weekday: "long" });
    const currentTime = today.toTimeString().slice(0, 5); // HH:MM format

    if (hours[currentDay]) {
      const { startHour, endHour, isOpen } = hours[currentDay];

      // Check if the current time is before opening time or after closing time today
      if (!isOpen || currentTime < startHour || currentTime > endHour) {
        setIsClosed(true);
        // Check if today will open later
        if (currentTime < startHour && isOpen) {
          setNextOpening(`Today at ${startHour}`);
        } else {
          // Otherwise, find the next day that opens
          setNextOpening(findNextOpening(hours, currentDay));
        }
      } else {
        setIsClosed(false);
      }
    }
  };

  // Find the next opening day and time
  const findNextOpening = (hours, currentDay) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let nextDayIndex = daysOfWeek.indexOf(currentDay) + 1;

    for (let i = 0; i < 7; i++) {
      const day = daysOfWeek[nextDayIndex % 7];
      if (hours[day] && hours[day].isOpen) {
        return `${day} at ${hours[day].startHour}`;
      }
      nextDayIndex++;
    }
    return "No upcoming opening hours";
  };

  // Handle search input and filter meals based on search term
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setFilteredMeals(
      meals.filter((meal) =>
        meal.name.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  // Add selected meal to the cart and check inventory levels
  const handleAddToCart = async (meal) => {
    if (meal.isDisabled) {
      alert("This dish is currently unavailable due to low stock.");
      return;
    }
    setSelectedMeal(meal);
    setShowModal(true);

    // Check inventory levels
    try {
      const response = await axios.get(
        `http://localhost:3001/dishes/checkInventory/${meal.ID}`
      );
      if (response.data.warning) {
        setNotification(response.data.message);
      }
    } catch (error) {
      console.error("Error checking inventory levels", error);
    }
  };

  // Add extras to the selected meal and close the modal
  const handleAddExtras = (mealWithExtras) => {
    dispatch({ type: "ADD_TO_CART", payload: mealWithExtras });
    setShowModal(false);
  };

  // Close the modal and reset selected meal
  const closeModal = () => {
    setShowModal(false);
    setSelectedMeal(null);
  };

  return (
    <div className={classes.menuPage}>
      {notification && <Notification message={notification} />}
      <header className={classes.menuHeader}>
        <input
          type="text"
          placeholder="Search for food..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: "10px",
            fontSize: "16px",
            color: "#333",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            width: "100%",
            maxWidth: "300px",
            margin: "0 auto",
            display: "block",
          }}
        />
      </header>
      <div className={classes.menuContainer} style={{ marginBottom: "20px" }}>
        {isClosed ? (
          <div className={classes.closedMessage}>
            <p>The Menu Is Currently Closed.</p>
            <p>We Will Open Next On: {nextOpening}</p>
          </div>
        ) : (
          <div className={classes.menuItems}>
            {" "}
            {/* Render your menu items here */}{" "}
          </div>
        )}
      </div>
      <main className={classes.menuMain}>
        {error && <div className={classes.error}>{error}</div>}
        <div className={classes.foodGrid}>
          {filteredMeals.map((meal) => (
            <div key={meal.ID} className={classes.mealItem}>
              <img
                src={meal.img}
                alt={meal.name}
                className={classes.mealImage}
              />
              <div className={classes.mealInfo}>
                <h2>{meal.name}</h2>
                <p>{meal.description}</p>
                <p>
                  Allergies :
                  {meal.allergies && meal.allergies !== "None"
                    ? ` ${meal.allergies}`
                    : ""}
                </p>
                <p>
                  {globalDiscount > 0 || meal.discount > 0 ? (
                    <>
                      <span style={{ textDecoration: "line-through" }}>
                        ₪{parseFloat(meal.price).toFixed(2)}
                      </span>{" "}
                      <span>
                        ₪
                        {getDiscountedPrice(
                          parseFloat(meal.price),
                          meal.discount
                        )}
                      </span>
                    </>
                  ) : (
                    <span>₪{parseFloat(meal.price).toFixed(2)}</span>
                  )}
                </p>

                {isWithinWorkHours ? (
                  <button
                    onClick={() => handleAddToCart(meal)}
                    className={classes.buyButton}
                    aria-label={`Add ${meal.name} to cart`}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <p className={classes.closedMessage}>
                    The Caravan Is Closed And You Can't Make An Order At This
                    Time.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      {showModal && (
        <Suspense fallback={<LoadingScreen />}>
          <Extra
            meal={selectedMeal}
            onAdd={handleAddExtras}
            onClose={closeModal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default MenuPage;