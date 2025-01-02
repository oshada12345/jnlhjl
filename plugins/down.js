const axios = require('axios');
const { cmd } = require("../command");
const { reply } = require("../lib/functions");
const fs = require('fs');
const path = require('path');

// Function to fetch the file as a stream with retry logic
const fetchFileStreamWithRetry = async (url, retries = 6) => {
    let attempt = 0;
    let fileStream;
    while (attempt < retries) {
        try {
            const response = await axios.get(url, {
                responseType: 'stream',
            });

            if (!response || !response.data) {
                throw new Error('No data received from URL');
            }

            fileStream = response.data;
            break; // Exit loop if download is successful
        } catch (error) {
            attempt++;
            console.error(`Error on attempt ${attempt}:`, error.message);
            if (attempt >= retries) {
                throw new Error('Max retry attempts reached');
            }
            // Wait before retrying (optional delay, e.g., 2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!fileStream) {
        throw new Error('Failed to download file after retries');
    }

    return fileStream;
};

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
            // Fetch the file stream with retry logic
            const fileStream = await fetchFileStreamWithRetry(mediaUrl);

            // Determine file extension
            const fileExtension = path.extname(mediaUrl) || ".file";
            const finalFileName = `${fileName || "Downloaded_File"}${fileExtension}`;

            // Create a temporary file path
            const tempFilePath = `/tmp/${finalFileName}`;
            const writeStream = fs.createWriteStream(tempFilePath);

            // Pipe the file stream into the file
            await new Promise((resolve, reject) => {
                fileStream.pipe(writeStream);
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

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
