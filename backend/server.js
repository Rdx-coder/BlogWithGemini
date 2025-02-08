const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const xml2js = require("xml2js");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const articleCache = new Map(); // ✅ Cache to avoid repeated AI requests

// ✅ Function to Parse Google Trends RSS Feed & Extract Related Keywords
const parseTrends = async (xmlData) => {
    const parser = new xml2js.Parser({ explicitArray: false });

    try {
        const result = await parser.parseStringPromise(xmlData);
        const items = result.rss.channel.item;

        if (!items || !Array.isArray(items)) {
            throw new Error("Invalid XML format");
        }

        return items.map((item) => ({
            title: item.title || "No Title",
            link: item.link || "#",
            image: item["ht:picture"] || "",
            source: item["ht:picture_source"] || "Unknown Source",
            relatedKeywords: item["ht:news_item"]
                ? Array.isArray(item["ht:news_item"])
                    ? item["ht:news_item"].map((newsItem) => newsItem["ht:news_item_title"] || "").filter(Boolean)
                    : []
                : [],
        }));
    } catch (error) {
        console.error("❌ Error parsing XML:", error);
        return [];
    }
};

// ✅ Generate Full SEO Blog Article using AI
async function generateFullArticle(title, relatedKeywords) {
    if (articleCache.has(title)) {
        console.log(`📝 Using cached article for: ${title}`);
        return articleCache.get(title);
    }

    try {
        console.log(`🔍 Generating AI article for: ${title}`);

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent({
            contents: [{ 
                role: "user", 
                parts: [{ text: `
                    Write a **SEO-friendly structured blog article** about "${title}".
                    Optimize for search engines by naturally incorporating these keywords: ${relatedKeywords.join(", ")}.
                    Format the response in clean **HTML structure** with **modern CSS styles**.

                    <article style="background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); max-width: 900px; margin: auto; font-family: 'Arial', sans-serif; line-height: 1.8;">
                    
                        <style>
                            .title {
                                font-size: 36px;
                                color: #0078ff;
                                font-weight: bold;
                                margin-bottom: 20px;
                                text-align: center;
                                text-transform: capitalize;
                            }
                            .section {
                                margin-top: 25px;
                                padding: 20px;
                                border-left: 5px solid #0078ff;
                                background: #f9f9f9;
                                border-radius: 8px;
                            }
                            h2 {
                                font-size: 26px;
                                color: #222;
                                border-bottom: 3px solid #0078ff;
                                padding-bottom: 6px;
                                margin-bottom: 15px;
                            }
                            p {
                                font-size: 18px;
                                color: #444;
                                margin-bottom: 15px;
                            }
                            ul {
                                padding-left: 25px;
                            }
                            ul li {
                                font-size: 18px;
                                color: #555;
                                margin-bottom: 10px;
                            }
                        </style>

                        <header>
                            <h1 class="title">${title}</h1>
                        </header>

                        <section class="section">
                            <h2>Introduction</h2>
                            <p>Provide a compelling introduction summarizing the topic.</p>
                        </section>

                        <section class="section">
                            <h2>Trend Breakdown</h2>
                            <ul>
                                ${relatedKeywords.map((keyword) => `<li>${keyword}</li>`).join("")}
                            </ul>
                        </section>

                        <section class="section">
                            <h2>In-Depth Analysis</h2>
                            <p>Explain why this topic is trending, key events, and industry insights.</p>
                        </section>

                        <section class="section">
                            <h2>Real-World Impact</h2>
                            <p>How this trend affects businesses, consumers, or industries.</p>
                        </section>

                        <section class="section">
                            <h2>Conclusion</h2>
                            <p>Summarize key takeaways and any future implications.</p>
                        </section>
                    </article>
                ` }]
            }]
        });

        if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
            throw new Error("AI response is empty");
        }

        const articleHTML = result.response.candidates[0].content.parts[0].text;
        articleCache.set(title, articleHTML);
        console.log("✅ AI-generated full article successfully!");
        return articleHTML;
    } catch (error) {
        console.error("❌ Error generating article:", error);
        return "<p>Failed to generate a full article.</p>";
    }
}

// ✅ Fetch Google Trends & Generate Full Articles
app.get('/trends', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const response = await axios.get('https://trends.google.com/trending/rss?geo=IN');
        const parsedTrends = await parseTrends(response.data);

        // ✅ Shuffle and Get Required Number of Topics
        const shuffledTrends = parsedTrends.sort(() => 0.5 - Math.random()).slice(0, parseInt(limit));

        // ✅ Generate AI Articles for Each Trend
        for (let trend of shuffledTrends) {
            trend.article = await generateFullArticle(trend.title, trend.relatedKeywords);
        }

        res.json(shuffledTrends);
    } catch (error) {
        console.error('❌ Error fetching trends:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

// ✅ Start the Server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
