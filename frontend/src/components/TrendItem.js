import React from "react";

const TrendItem = ({ trend }) => {
    if (!trend || typeof trend !== "object") return null; // ✅ Prevents crashes

    const { title = "No Title", link = "#", image, article } = trend;

    console.log("📌 Rendering Trend:", trend); // ✅ Debug log to check if article exists

    return (
        <div className="trend-item">
            {/* ✅ Title */}
            <h2>
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {title}
                </a>
            </h2>

            {/* ✅ Image (if available) */}
            {image && <img src={image} alt={title} />}

            {/* ✅ Render Full AI-generated Article */}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article || "<p>No content available.</p>" }} />
        </div>
    );
};

export default TrendItem;
