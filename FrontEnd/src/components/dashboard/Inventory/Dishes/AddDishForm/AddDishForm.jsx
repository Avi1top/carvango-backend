// import React, { useState } from "react";
// import axios from "axios";
// import classes from "./AddDishForm.module.css";

// const AddDishForm = ({ onDishAdded }) => {
//   const [form, setForm] = useState({
//     name: "",
//     price: "",
//     description: "",
//     allergies: "",
//     image_path: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:3001/menu", form);
//       onDishAdded(response.data);
//       setForm({
//         name: "",
//         price: "",
//         description: "",
//         allergies: "",
//         image_path: "",
//       });
//     } catch (error) {
//       console.error("Error adding dish:", error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className={classes.form}>
//       <input
//         type="text"
//         name="name"
//         placeholder="Dish Name"
//         value={form.name}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="number"
//         name="price"
//         placeholder="Price"
//         value={form.price}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="text"
//         name="description"
//         placeholder="Description"
//         value={form.description}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="text"
//         name="allergies"
//         placeholder="Allergies"
//         value={form.allergies}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="text"
//         name="image_path"
//         placeholder="Image Path"
//         value={form.image_path}
//         onChange={handleChange}
//         required
//       />
//       <button type="submit">Add Dish</button>
//     </form>
//   );
// };

// export default AddDishForm;
