require("dotenv").config(); // Load environment variables at the top

const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

async function getLyricsFromLyricsOvH(song, artist) {
    try {
        // Replace with Lyrics.ovh API request
        const lyricsUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
        const response = await axios.get(lyricsUrl);

        // Check if lyrics are found
        if (response.data.lyrics) {
            return { song, artist, lyrics: response.data.lyrics };
        } else {
            return { error: "Lyrics not found" };
        }
    } catch (error) {
        console.error("❌ Error fetching lyrics:", error.message);
        return { error: "Error fetching lyrics. Please try again later." };
    }
}

app.get("/api/get_lyric_search", async (req, res) => {
    const { name, artist } = req.query;

    // Ensure song name and artist are provided
    if (!name || !artist) {
        return res.status(400).json({ error: "Song name and artist are required" });
    }

    const result = await getLyricsFromLyricsOvH(name, artist);
    res.json(result); // Return the result
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
