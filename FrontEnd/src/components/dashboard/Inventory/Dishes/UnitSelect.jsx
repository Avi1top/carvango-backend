import React, { useState, useEffect } from "react";
import { FormControl, Select, MenuItem } from "@mui/material";

const UnitSelect = ({ ingredientUnit, onUnitChange }) => {
  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");

  // Determine the available units based on the ingredient unit
  useEffect(() => {
    const units = handleUnitListChange(ingredientUnit);
    setAvailableUnits(units);

    // Set the initial selected unit if it's valid
    setSelectedUnit(units.includes(ingredientUnit) ? ingredientUnit : "");
  }, [ingredientUnit,]);

  const handleChange = (event) => {
    const newUnit = event.target.value;
    setSelectedUnit(newUnit);
    onUnitChange(newUnit); // Propagate the change up to the parent component
  };

  return (
    <FormControl fullWidth>
      <Select
        value={selectedUnit}
        onChange={handleChange}
        style={{ fontSize: "16px" }}
        required
      >
      
        {availableUnits.map((unit) => (
          <MenuItem key={unit} value={unit} style={{ fontSize: "14px" }}>
            {unit}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Example of unit list generation based on ingredient unit
const handleUnitListChange = (ingredientUnit) => {
  const unitMappings = {
    "KG": ["KG", "gram"],
    "gram": ["gram", "KG"],
    "L": ["M/L", "L"],
    "M/L": ["M/L", "L"],
    "piece": ["piece"],
    "G": ["KG", "gram"],
    "ML": ["M/L", "L"],
  };
  return unitMappings[ingredientUnit] || []; // Default to ["unit"] if none match
};

export default UnitSelect;
