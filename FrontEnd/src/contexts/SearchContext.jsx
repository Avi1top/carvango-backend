import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

// Provides the search query state and updater function to child components
export const SearchProvider = ({ children }) => {
  const [searchQueryForEmail, setSearchQueryForEmail] = useState("");

  return (
    <SearchContext.Provider
      value={{ searchQueryForEmail, setSearchQueryForEmail }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook to access the search context values in components
export const useSearch = () => useContext(SearchContext);
