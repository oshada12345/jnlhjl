const axios = require("axios");
const { cmd } = require("../command");

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

        // Function to download file directly into buffer with retry logic
        const downloadFile = async (url) => {
            try {
                const response = await axios({
                    url,
                    method: "GET",
                    responseType: "arraybuffer",
                    timeout: 60000, // Timeout of 60 seconds
                    maxRedirects: 5, // Follow redirects
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    },
                });

                return response.data; // Return the file buffer directly
            } catch (error) {
                console.error("Download Error:", error.message);
                throw error;
            }
        };

        try {
            const mediaBuffer = await downloadFile(mediaUrl); // Download the file as a buffer

            const fileSizeInMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2);

            if (fileSizeInMB > 2000) {
                return await reply("*File exceeds the 2GB limit!*");
            }

            // File extension and MIME type
            const path = require("path");
            const fileExtension = path.extname(mediaUrl) || ".file";
            const finalFileName = `${fileName || "Downloaded_File"}${fileExtension}`;

            // Send document via WhatsApp
            const message = {
                document: mediaBuffer,
                caption: `🎬 *${fileName || "File"}*\n\n*File Size:* ${fileSizeInMB} MB\n\n_Provided by DARK SHUTER_ 🎬`,
                mimetype: "application/octet-stream",
                fileName: finalFileName,
            };

            await conn.sendMessage(from, message, { quoted: mek });

            // React with success
            await conn.sendMessage(from, {
                react: { text: "✔️", key: mek.key },
            });

        } catch (error) {
            console.error("Error downloading or sending file:", error.message);

            if (error.message.includes("403")) {
                await reply("*Error: Access Forbidden (403). Please check the URL or try another source.*");
            } else {
                await reply("*An error occurred while processing the file. Please try again!*");
            }
        }
    },
);
