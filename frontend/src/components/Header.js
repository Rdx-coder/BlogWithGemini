import React from "react";

const Header = ({ darkMode, toggleDarkMode }) => {
    return (
        <header className="header">
            <h1>Latest AI-Generated News</h1>
            <button className="toggle-btn" onClick={toggleDarkMode}>
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
        </header>
    );
};

export default Header;
