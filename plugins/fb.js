const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
    pattern: 'fbvideo',
    react: '📥',
    alias: ['facebook', 'fb'],
    desc: 'Download Facebook video',
    use: '.fbvideo <Facebook Video URL>',
    category: 'download',
    filename: __filename
}, async (conn, mek, m, { from, body, args, reply }) => {
    try {
        const url = args[0];
        if (!url) return reply('Please provide a valid Facebook video URL.');

        // API call to fetch video details
        const apiUrl = `https://www.dark-yasiya-api.site/download/fbdl1?url=${url}`;
        const response = await axios.get(apiUrl);
        const { status, result } = response.data;

        if (!status) return reply('Sorry, I couldn\'t fetch the video details. Please try again.');

        const sdLink = result.sd;
        const hdLink = result.hd;

        // Ask user to choose quality
        const optionsMessage = `Please choose the video quality:
        
        1. SD Quality
        2. HD Quality`;
        await conn.sendMessage(from, { text: optionsMessage });

        // Wait for user reply
        const filter = (response) => response.key.fromMe === false && response.message && response.message.text && response.key.remoteJid === from;
        const userReply = await conn.waitForMessage(from, { timeout: 30000, filter });

        if (!userReply) return reply('You took too long to reply. Please try again.');

        const choice = userReply.message.text.toLowerCase().trim();
        let downloadUrl;

        if (choice === '1' || choice === 'sd') {
            downloadUrl = sdLink;
        } else if (choice === '2' || choice === 'hd') {
            downloadUrl = hdLink;
        } else {
            return reply('Invalid choice. Please reply with either "1" for SD or "2" for HD.');
        }

        // Download the video
        reply('Downloading your video, please wait...');
        const videoPath = path.resolve(__dirname, `fb_video_${Date.now()}.mp4`);
        const writer = fs.createWriteStream(videoPath);

        const videoResponse = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream',
        });

        videoResponse.data.pipe(writer);

        // Wait for the download to complete
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Send the downloaded video
        await conn.sendMessage(from, { video: fs.readFileSync(videoPath), caption: 'Here is your video!' });

        // Clean up the downloaded file
        fs.unlinkSync(videoPath);
    } catch (error) {
        console.error(error);
        reply('Something went wrong while processing your request. Please try again later.');
    }
});
