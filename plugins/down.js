const axios = require("axios");
const fs = require("fs");
const path = require("path");
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

        // Function to download file with streaming
        const downloadFile = async (url, outputPath) => {
            const writer = fs.createWriteStream(outputPath);

            const response = await axios({
                url,
                method: "GET",
                responseType: "stream",
                timeout: 60000, // Timeout of 60 seconds
            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });
        };

        try {
            // Define file paths
            const tempFileName = `temp_${Date.now()}`;
            const tempFilePath = path.join(__dirname, tempFileName);
            const finalFileName = `${fileName || "Downloaded_File"}${path.extname(mediaUrl) || ".file"}`;

            // Download file with streaming
            await downloadFile(mediaUrl, tempFilePath);

            // Check file size
            const fileSizeInBytes = fs.statSync(tempFilePath).size;
            const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

            if (fileSizeInMB > 2000) {
                fs.unlinkSync(tempFilePath); // Delete the temporary file
                return await reply("*File exceeds the 2GB limit!*");
            }

            // Read the file into a buffer
            const mediaBuffer = fs.readFileSync(tempFilePath);

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

            // Cleanup temporary file
            fs.unlinkSync(tempFilePath);
        } catch (error) {
            console.error("Error downloading or sending file:", error.message);

            // Cleanup temporary file if it exists
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }

            await reply("*An error occurred while processing the file. Please try again!*");
        }
    },
);
