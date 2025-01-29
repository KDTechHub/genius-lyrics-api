require("dotenv").config(); // Load environment variables at the top

const express = require("express");
const axios = require("axios");

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

        const songPath = searchResponse.data.response.hits[0].result.path;

        // Get song details
        const songDetailsUrl = `https://api.genius.com${songPath}`;
        const songDetailsResponse = await axios.get(songDetailsUrl, {
            headers: { Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}` }
        });

        const lyrics = songDetailsResponse.data.response.song.lyrics_body;

        return { song, artist, lyrics: lyrics || "Lyrics not available." };
    } catch (error) {
        console.error("❌ Error fetching lyrics:", error.message);
        return { error: "Error fetching lyrics. Please try again later." };
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
