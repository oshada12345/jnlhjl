const axios = require("axios");
const config = require("../config");
const { cmd, commands } = require("../command");
const {
    fetchJson,
} = require("../lib/functions");

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

        // Retry logic for downloading file
        const fetchFile = async (url) => {
            try {
                const response = await axios.get(url, {
                    responseType: "arraybuffer",
                    timeout: 60000, // Retry after timeout
                });
                return response;
            } catch (error) {
                if (error.code === "ECONNABORTED") {
                    console.log("Retrying download...");
                    return fetchFile(url); // Retry download
                }
                throw error;
            }
        };

        try {
            const response = await fetchFile(mediaUrl); // Download file
            const mediaBuffer = Buffer.from(response.data, "binary");
            const fileSizeInMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2);

            // File extension and MIME type
            const path = require("path");
            const fileExtension = path.extname(mediaUrl) || ".file";
            const finalFileName = `${fileName || "Downloaded_File"}${fileExtension}`;
            const mimeType = response.headers["content-type"] || "application/octet-stream";

            if (fileSizeInMB > 2000) {
                return await reply("*File exceeds the 2GB limit!*");
            }

            // Send document via WhatsApp
            const message = {
                document: mediaBuffer,
                caption: `🎬 *${fileName || "File"}*\n\n*File Size:* ${fileSizeInMB} MB\n\n_Provided by DARK SHUTER_ 🎬`,
                mimetype: mimeType,
                fileName: finalFileName,
            };

            await conn.sendMessage(from, message, { quoted: mek });

            // React with success
            await conn.sendMessage(from, {
                react: { text: "✔️", key: mek.key },
            });
        } catch (error) {
            console.error("Error:", error.message);
            await reply("*An error occurred while processing the file. Please try again!*");
        }
    },
);
