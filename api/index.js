const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const app = express();
const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

async function getLyricsFromGenius(song, artist) {
    try {
        const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(song + " " + artist)}`;
        const searchResponse = await axios.get(searchUrl, {
            headers: { Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}` }
        });

        if (searchResponse.data.response.hits.length === 0) {
            return { error: "Lyrics not found" };
        }

        const songUrl = searchResponse.data.response.hits[0].result.url;
        const lyrics = await scrapeLyrics(songUrl);
        return { song, artist, lyrics };

    } catch (error) {
        return { error: "Error fetching lyrics" };
    }
}

async function scrapeLyrics(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let lyrics = "";

        $("div[data-lyrics-container='true']").each((_, element) => {
            lyrics += $(element).text() + "\n\n";
        });

        return lyrics.trim();
    } catch (error) {
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

module.exports = app;
