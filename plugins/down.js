const axios = require('axios');
const { reply } = require("../lib/functions");
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { pipeline } = require('stream/promises');
const config = require("../config");
const { cmd, commands } = require("../command");
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
} = require("../lib/functions");


// Function to download the file as a stream
const fetchFileStream = async (url) => {
    try {
        const response = await axios.get(url, {
            responseType: 'stream', // Use stream response
        });
        return response.data; // Return stream
    } catch (error) {
        if (error.code === "ECONNABORTED") {
            console.log("Retrying download...");
            return fetchFileStream(url); // Retry on timeout
        }
        throw error;
    }
};


cmd(
    {
        pattern: "movie",
        alias: ["movi", "tests"],
        use: ".movie <query>",
        react: "🔎",
        desc: "Moive downloader",
        category: "movie",
        filename: __filename,
    },

    async (conn, mek, m, { from, quoted, args, q, reply }) => {
        try {
            let sadas = await fetchJson(
                `https://www.dark-yasiya-api.site/movie/sinhalasub/search?text=${q}`,
            );
            const msg = `*🎥 MOVIE SEARCH 🎥*`;

            if (sadas.data.length < 1)
                return await conn.sendMessage(
                    from,
                    { text: "🚩 *I couldn't find anything :(*" },
                    { quoted: mek },
                );

            let text = `${msg}\n\n`;
            sadas.data.forEach((v, index) => {
                text += `${index + 1}. ${v.Title}\nLink: ${v.Link}\n\n`;
            });

            await conn.sendMessage(from, { text }, { quoted: mek });
        } catch (e) {
            console.log(e);
            await conn.sendMessage(
                from,
                { text: "🚩 *Error !!*" },
                { quoted: mek },
            );
        }
    },
);

cmd(
    {
        pattern: "infodl",
        alias: ["mdv"],
        use: ".moviedl <url>",
        react: "🎥",
        desc: "download movies from sinhalasub.lk",
        filename: __filename,
    },

    async (conn, mek, m, { from, q, reply }) => {
        try {
            if (!q) return reply("🚩 *Please give me a url*");

            let sadas = await fetchJson(
                `https://www.dark-yasiya-api.site/movie/sinhalasub/movie?url=${q}`,
            );

            if (!sadas || sadas.length < 1)
                return await conn.sendMessage(
                    from,
                    { text: "🚩 *I couldn't find anything :(*" },
                    { quoted: mek },
                );

            let text = `🎥  MOVIE DOWNLOADER 🎥\n\n*Title:* ${sadas.title}\n*Release:* ${sadas.date}\n*Rating:* ${sadas.rating}\n*Runtime:* ${sadas.duration}\n*Director:* ${sadas.author}\n*Country:* ${sadas.country}\n\nDownload Links:\n`;

            sadas.downloadLinks.forEach((v) => {
                text += `- ${v.quality} (${v.size}): ${v.link}\n`;
            });

            await conn.sendMessage(from, { text }, { quoted: mek });
        } catch (e) {
            console.log(e);
            await conn.sendMessage(
                from,
                { text: "🚩 *Error !!*" },
                { quoted: mek },
            );
        }
    },
);


cmd(
    {
        pattern: "fit",
        react: "📥",
        dontAddCommandList: true,
        filename: __filename,
    },
    async (conn, mek, m, { from, q, reply }) => {
        if (!q) {
            return await reply("*Please provide a direct URL!*");
        }

        const [mediaUrl, fileName] = q.split("±").map((item) => item.trim());

        if (!mediaUrl || !mediaUrl.startsWith("http")) {
            return await reply("*Invalid URL provided!*");
        }

        try {
            // Fetch file stream
            const fileStream = await fetchFileStream(mediaUrl);

            // Determine file extension
            const fileExtension = path.extname(mediaUrl) || ".file";
            const finalFileName = `${fileName || "Downloaded_File"}${fileExtension}`;

            // Create a temporary file path
            const tempFilePath = `/tmp/${finalFileName}`;
            const writeStream = fs.createWriteStream(tempFilePath);

            // Pipe the file stream into the file
            await pipeline(fileStream, writeStream);

            // File size calculation
            const stats = fs.statSync(tempFilePath);
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

            // Check file size before sending
            if (fileSizeInMB > 2000) {
                fs.unlinkSync(tempFilePath); // Clean up temp file
                return await reply("*File exceeds the 2GB limit!*");
            }

            // Send the file via WhatsApp
            const message = {
                document: fs.createReadStream(tempFilePath),
                caption: `🎬 *${fileName || "File"}*\n\n*File Size:* ${fileSizeInMB} MB\n\n_Provided by DARK SHUTER_ 🎬`,
                mimetype: 'application/octet-stream',
                fileName: finalFileName,
            };

            await conn.sendMessage(from, message, { quoted: mek });

            // Clean up the temp file after sending
            fs.unlinkSync(tempFilePath);

            // React with success
            await conn.sendMessage(from, {
                react: { text: "✔️", key: mek.key },
            });

        } catch (error) {
            console.error("Error downloading or sending file:", error.message);
            await reply("*An error occurred while processing the file. Please try again!*");
        }
    }
);
