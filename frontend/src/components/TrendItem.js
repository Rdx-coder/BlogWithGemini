import React from "react";
import "../App.css";  // ✅ Import CSS correctly

const TrendItem = ({ trend }) => {
    if (!trend || typeof trend !== "object") return null;

    const { title, link, image, article, relatedQueries = [] } = trend; 

    return (
        <div className="trend-item">
            <h2>
                <a href={link || "#"} target="_blank" rel="noopener noreferrer">
                    {title || "No Title"}
                </a>
            </h2>
            {image && <img src={image} alt={title} />}

            {/* ✅ Check if relatedQueries exists before mapping */}
            {relatedQueries.length > 0 && (
                <div className="trend-breakdown">
                    <h3>Related Searches:</h3>
                    <ul>
                        {relatedQueries.map((query, index) => (
                            <li key={index}>{query}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="article-content" dangerouslySetInnerHTML={{ __html: article || "<p>No content available.</p>" }} />
        </div>
    );
};

export default TrendItem;
