require("dotenv").config(); // Load environment variables at the top

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;
const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

if (!GENIUS_ACCESS_TOKEN) {
    console.error("❌ Error: GENIUS_ACCESS_TOKEN is missing. Set it in your Vercel environment variables.");
    process.exit(1); // Stop execution if no token is found
}

async function getLyricsFromGenius(song, artist) {
    try {
        const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(song + " " + artist)}`;
        const searchResponse = await axios.get(searchUrl, {
            headers: { Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}` }
        });

        if (!searchResponse.data.response.hits.length) {
            return { error: "Lyrics not found" };
        }

        const songUrl = searchResponse.data.response.hits[0].result.url;
        console.log("Song URL:", songUrl); // Log the URL for debugging
        const lyrics = await scrapeLyrics(songUrl);
        return { song, artist, lyrics };

    } catch (error) {
        console.error("❌ Error fetching lyrics:", error.message);
        return { error: "Error fetching lyrics. Please try again later." };
    }
}

async function scrapeLyrics(url) {
    try {
        const response = await axios.get(url);
        console.log("Page content:", response.data); // Log the page content for debugging
        const $ = cheerio.load(response.data);
        let lyrics = "";

        // Update the selector based on your inspection of the Genius page structure
        $("div.lyrics").each((_, element) => {
            lyrics += $(element).text().trim() + "\n\n";
        });

        return lyrics || "Lyrics not available.";
    } catch (error) {
        console.error("❌ Error scraping lyrics:", error.message);
        return "Error retrieving lyrics.";
    }
}

app.get("/api/get_lyric_search", async (req, res) => {
    const { name, artist } = req.query;

    if (!name || !artist) {
        return res.status(400).json({ error: "Song name and artist are required" });
    }

    const result = await getLyricsFromGenius(name, artist);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
