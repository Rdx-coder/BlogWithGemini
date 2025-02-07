import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
    return (
        <input 
            type="text" 
            placeholder="Search articles..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="search-bar"
        />
    );
};

export default SearchBar;
