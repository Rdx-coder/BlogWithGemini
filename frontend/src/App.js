import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/Searchbar';
import TrendItem from './components/TrendItem';
import Newsletter from './components/Newsletter';

const App = () => {
    const [trends, setTrends] = useState([]);  // Stores all fetched topics
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrends();  // Load initial trends
    }, []);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/trends?limit=5`);
            if (Array.isArray(response.data) && response.data.length > 0) {
                // ✅ Append new trends without duplicates
                setTrends((prevTrends) => {
                    const newTrends = response.data.filter(
                        (newTrend) => !prevTrends.some((oldTrend) => oldTrend.title === newTrend.title)
                    );
                    return [...prevTrends, ...newTrends]; 
                });
            } else {
                console.log("🚀 No more topics to load.");
            }
        } catch (error) {
            console.error("❌ Error fetching trends:", error);
            setError("Failed to load trends.");
        }
        setLoading(false);
    };

    return (
        <div className="container">
            {/* <Header />
            <Sidebar /> */}
            <main className="main-content">
                <SearchBar />
                {trends.length === 0 && loading && <h2>Loading trends...</h2>}
                {error && <h2>{error}</h2>}

                {trends.map((trend, index) => (
                    <TrendItem key={index} trend={trend} />
                ))}

                {/* ✅ Always Visible Load More Button */}
                <button className="load-more" onClick={fetchTrends} disabled={loading}>
                    {loading ? "Loading..." : "Load More 🔽"}
                </button>

                <Newsletter />
            </main>
        </div>
    );
};

export default App;
