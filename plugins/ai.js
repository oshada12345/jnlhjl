const config = require('../config');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "ai",
    react: "📑",
    desc: "AI chat.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    try {
        // Check if the query is provided
        if (!q) {
            return reply("Please provide a query for the AI chat.");
        }

        // Fetch the AI response
        let response = await fetchJson(`https://www.dark-yasiya-api.site/ai/chatgpt?q${encodeURIComponent(q)}`);

        // Ensure data exists in the response
        if (response && response.data) {
            return reply(`${response.data}`);
        } else {
            return reply("No valid response from the AI server.");
        }
    } catch (e) {
        console.error("Error in AI command:", e);
        reply(`An error occurred: ${e.message || e}`);
    }
});0.

                   
