import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaxRateSetting = () => {
  const [taxRate, setTaxRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const response = await axios.get('http://localhost:3001/tax');
        setTaxRate(response.data.value);
      } catch (err) {
        setError('Error fetching tax rate');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxRate();
  }, []);

  const handleUpdateTaxRate = async () => {
    try {
      await axios.post('http://localhost:3001/tax', { value: taxRate });
      alert('Tax rate updated successfully');
    } catch (err) {
      setError('Error updating tax rate');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Set Tax Rate</h3>
      <input
        type="number"
        min="0"
        max="0.99"
        step="0.01"
        value={taxRate}
        onChange={(e) => setTaxRate(Math.max(0.01, e.target.value))}
        style={{
          fontSize: "16px",
          padding: "2px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          marginRight: "10px",
        }}
      />
      <button
        onClick={handleUpdateTaxRate}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "8px 16px",
          transition: "background-color 0.3s ease",
          marginLeft: "10px",
        }}
      >
        Update Tax Rate
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default TaxRateSetting;
