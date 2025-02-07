import React from "react";

const TrendItem = ({ trend }) => {
    return (
        <div className="trend-item">
            <h2><a href={trend.link} target="_blank" rel="noopener noreferrer">{trend.title}</a></h2>
            {trend.image && <img src={trend.image} alt={trend.title} />}
            <p><strong>Summary:</strong> {trend.article.slice(0, 150)}...</p>
            <p>{trend.article}</p>
        </div>
    );
};

export default TrendItem;
