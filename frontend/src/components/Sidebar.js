import React from "react";

const Sidebar = ({ categories = [], setSelectedCategory }) => {
    if (!Array.isArray(categories)) {
        console.error("❌ Sidebar Error: `categories` is not an array:", categories);
        return null; // ✅ Prevents rendering if categories are invalid
    }

    return (
        <aside className="sidebar">
            <h2>Categories</h2>
            <ul>
                {categories.map((category, index) => (
                    <li key={index} onClick={() => setSelectedCategory(category)}>
                        {category}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
