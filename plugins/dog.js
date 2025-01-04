const axios = require("axios"); // Import axios
const config = require("../config");
const { cmd } = require("../command");
const { fetchJson } = require("../lib/functions"); // Ensure fetchJson is properly defined and imported

cmd(
    {
        pattern: "movie",
        alias: ["movi", "tests"],
        use: ".movie <query>",
        react: "🔎",
        desc: "Movie downloader",
        category: "movie",
        filename: __filename,
    },
    async (conn, mek, m, { from, q, reply }) => {
        try {
            if (!q) return await reply("🚩 Please provide a search query!");

            let sadas = await fetchJson(
                `https://darksadas-yt-sinhalasub-search.vercel.app/?q=${q}`,
            );
            if (!sadas || sadas.data.length < 1) {
                return await conn.sendMessage(
                    from,
                    { text: "🚩 *I couldn't find anything :(*" },
                    { quoted: mek },
                );
            }

            let msg = `*🎥 MOVIE SEARCH 🎥*\n\n`;
            sadas.data.forEach((v, index) => {
                msg += `📌 ${index + 1}. *${v.Title}*\nCommand: .infodl ${v.Link}\n\n`;
            });

            return await conn.sendMessage(from, { text: msg }, { quoted: mek });
        } catch (e) {
            console.error(e);
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
        desc: "Download movies from sinhalasub.lk",
        filename: __filename,
    },
    async (conn, mek, m, { from, q, prefix, reply }) => {
        try {
            if (!q) return reply("🚩 *Please provide a URL!*");

            let sadas = await fetchJson(
                `https://darksadas-yt-sinhalasub-info-dl.vercel.app/?url=${q}`,
            );
            if (!sadas || sadas.length < 1) {
                return await conn.sendMessage(
                    from,
                    { text: "🚩 *I couldn't find anything :(*" },
                    { quoted: mek },
                );
            }

            let msg = `
*🎥 MOVIE DOWNLOADER 🎥*
*Image* : ${sadas.image}
*Title   : ${sadas.title}*
*Release ➜* _${sadas.date}_
*Rating ➜* _${sadas.rating}_
*Runtime ➜* _${sadas.duration}_
*Director ➜* _${sadas.author}_
*Country ➜* _${sadas.country}_\n\n`;

            sadas.downloadLinks.forEach((v, index) => {
                msg += `📌 ${index + 1}. Quality: *${v.quality}* - Size: *${v.size}*\nCommand: ${prefix} mn ${v.link}\n${sadas.title} - ${v.quality} - ${v.size}\n\n`;
            });

            return await conn.sendMessage(from, { text: msg }, { quoted: mek });
        } catch (e) {
            console.error(e);
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
        pattern: "mn",
        react: "🎥",
        alias: ["online", "test", "bot"],
        desc: "Check bot online or not.",
        use: ".alive",
        filename: __filename,
    },
    async (conn, mek, m, { from, q, prefix, reply }) => {
        try {
            if (!q) {
                return await reply(
                    '🚩 *Invalid input! Please provide a valid command with "±".*',
                );
            }

            const [datae, datas] = q.split("±");

            let sadas = await fetchJson(
                `https://darksadas-yt-sinhalasub-dl.vercel.app/?url=${datae}`,
            );

            const da = sadas.downloadLink.split("https://pixeldrain.com/u/")[1];
            const fhd = `https://pixeldrain.com/api/file/${da}`;

            const msg = `*DOWNLOAD MOVIE*\n\n🎬 Movie: *\n${sadas.title}*\n\nCommand: ${prefix} fit ${fhd} `;

            return await conn.sendMessage(from, { text: msg }, { quoted: mek });
        } catch (e) {
            console.error(e);
            reply("🚩 *Error !!*");
        }
    },
);                const cmd = require("cmd-handler"); // Replace with your command handler import
const axios = require("axios");
const FileType = require("file-type");

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

        const downloadFile = async (url) => {
            try {
                const response = await axios({
                    url,
                    method: "GET",
                    responseType: "arraybuffer",
                    timeout: 120000, // 2 minutes timeout
                    maxRedirects: 5,
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                    },
                });
                return response.data; // File buffer
            } catch (error) {
                console.error("Download Error:", error.message);
                throw error;
            }
        };

        try {
            const mediaBuffer = await downloadFile(mediaUrl);

            if (!mediaBuffer || mediaBuffer.length === 0) {
                return await reply("*Unable to download the file. Please verify the URL and try again!*");
            }

            const fileSizeInMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2);

            if (fileSizeInMB > 2000) {
                return await reply("*File exceeds the 2GB limit!*");
            }

            const fileType = await FileType.fromBuffer(mediaBuffer);

            if (!fileType) {
                return await reply("*Unable to detect file type. Please verify the URL or try another file!*");
            }

            const detectedExtension = fileType.ext;
            const detectedMimeType = fileType.mime;
            const finalFileName = `${fileName || "Downloaded_File"}.${detectedExtension}`;

            const message = {
                mimetype: detectedMimeType,
                fileName: finalFileName,
                caption: `🎬 *${fileName || "File"}*\n\n*File Size:* ${fileSizeInMB} MB\n\n_Provided by DARK SHUTER_ 🎬`,
            };

            if (detectedMimeType.startsWith("video/")) {
                message.video = mediaBuffer; // Send as video
            } else {
                message.document = mediaBuffer; // Send as document
            }

            await conn.sendMessage(from, message, { quoted: mek });

            await conn.sendMessage(from, {
                react: { text: "✔️", key: mek.key },
            });
        } catch (error) {
            console.error("Error downloading or sending file:", error);

            if (error.response && error.response.status === 403) {
                await reply("*Error: Access Forbidden (403). Please check the URL or try another source.*");
            } else {
                await reply("*An error occurred while processing the file. Please try again!*");
            }
        }
    }
);
