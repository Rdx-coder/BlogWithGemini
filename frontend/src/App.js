import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/Searchbar";
import TrendItem from "./components/TrendItem";
import Newsletter from "./components/Newsletter";

const App = () => {
    const [trends, setTrends] = useState([]); // Stores fetched trending topics
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrends(); // Load initial trends on page load
    }, []);

    // ✅ Fetch new trending topics
    const fetchTrends = async () => {
        if (loading) return; // Prevent multiple requests
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`https://blogwithgemini.onrender.com/trends?limit=5`);
            if (Array.isArray(response.data) && response.data.length > 0) {
                // ✅ Append only new unique trends (avoid duplicates)
                setTrends((prevTrends) => {
                    const newTrends = response.data.filter(
                        (newTrend) => !prevTrends.some((oldTrend) => oldTrend.title === newTrend.title)
                    );
                    return [...prevTrends, ...newTrends];
                });
            } else {
                console.log("🚀 No more new topics available.");
            }
        } catch (error) {
            console.error("❌ Error fetching trends:", error);
            setError("Failed to load trends. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="container">
            {/* <Header />
            <Sidebar /> */}
            <main className="main-content">
                <SearchBar />
                
                {/* ✅ Show error message if something goes wrong */}
                {error && <h2 className="error">{error}</h2>}

                {/* ✅ Show loading message if trends are being fetched */}
                {trends.length === 0 && loading && <h2>Loading trends...</h2>}

                {/* ✅ Render trending topics */}
                {trends.map((trend, index) => (
                    <TrendItem key={index} trend={trend} />
                ))}

                {/* ✅ Always show the Load More button */}
                <button className="load-more" onClick={fetchTrends} disabled={loading}>
                    {loading ? "Loading..." : "Load More 🔽"}
                </button>

                <Newsletter />
            </main>
        </div>
    );
};

export default App;
