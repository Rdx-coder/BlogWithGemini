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

// ✅ Cache to prevent unnecessary AI requests
const articleCache = new Map();

// ✅ Generate a Fully Structured Article
async function generateFullArticle(title) {
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
                    Write a **high-quality, structured blog article** about "${title}" in **HTML format** with embedded CSS styles.
                    
                    The article must be beautifully formatted with proper spacing, modern typography, and a professional layout.
                    
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
                            .introduction, .key-insights, .detailed-analysis, .real-world-impact, .conclusion {
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
                            blockquote {
                                font-size: 20px;
                                font-style: italic;
                                color: #666;
                                border-left: 5px solid #0078ff;
                                padding-left: 15px;
                                margin: 20px 0;
                            }
                            img {
                                width: 100%;
                                max-height: 400px;
                                object-fit: cover;
                                border-radius: 10px;
                                margin-top: 15px;
                            }
                        </style>

                        <header>
                            <h1 class="title">${title}</h1>
                        </header>

                        <section class="introduction">
                            <h2>Introduction</h2>
                            <p>Provide a compelling introduction summarizing the topic.</p>
                        </section>

                        <section class="key-insights">
                            <h2>Key Insights</h2>
                            <ul>
                                <li>First key point related to ${title}</li>
                                <li>Second key point with supporting data</li>
                            </ul>
                        </section>

                        <section class="detailed-analysis">
                            <h2>Detailed Analysis</h2>
                            <p>Explain the topic in depth with examples, data, and key facts.</p>
                            <blockquote>"A deep dive into ${title} and its real-world significance."</blockquote>
                        </section>

                        <section class="real-world-impact">
                            <h2>Real-World Impact</h2>
                            <p>Describe how ${title} affects industries, businesses, or consumers.</p>
                        </section>

                        <section class="conclusion">
                            <h2>Conclusion</h2>
                            <p>Summarize the key takeaways and any future implications.</p>
                        </section>
                    </article>
                ` }]
            }]
        });

        if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
            throw new Error("AI response is empty");
        }

        const articleHTML = result.response.candidates[0].content.parts[0].text;
        articleCache.set(title, articleHTML); // ✅ Store in cache

        console.log("✅ AI-generated full article successfully!");
        return articleHTML;
    } catch (error) {
        console.error("❌ Error generating article:", error);
        return "<p>Failed to generate a full article.</p>";
    }
}



// ✅ Fetch Google Trends & Generate Full Articles
app.get("/trends", async (req, res) => {
    try {
        const { data } = await axios.get("https://trends.google.com/trending/rss?geo=IN");
        xml2js.parseString(data, async (err, result) => {
            if (err) return res.status(500).json({ error: "Error parsing XML" });

            const trends = await Promise.all(
                result.rss.channel[0].item.map(async (item) => {
                    const fullArticle = await generateFullArticle(item.title[0]);

                    return {
                        title: item.title[0],
                        link: item.link[0],
                        image: item["ht:picture"] ? item["ht:picture"][0] : null,
                        article: fullArticle,
                    };
                })
            );

            res.json(trends);
        });
    } catch (error) {
        console.error("❌ Error fetching trends:", error);
        res.status(500).json({ error: "Failed to fetch trends" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
