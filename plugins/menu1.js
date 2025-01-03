const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu",
    react: "🛸",
    alias: ["panel", "commands"],
    desc: "Get bot's command list.",
    category: "main",
    use: '.menu',
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, umarmd, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const config = await readEnv();
        let madeMenu = `╭━━━━━━━━━━━━━━━━━━━
*⇆ ʜɪɪ ᴍʏ ᴅᴇᴀʀ ғʀɪᴇɴᴅ ⇆*
      *${pushname}*
╰━━━━━━━━━━━━━━━━━━━
┏━━━━━━━━━━━━━━━━━━━━━━━
      *ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ sɪʟᴇɴᴛ-sᴏʙx-ᴍᴅ*
      *ғᴜʟʟ ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ*
┗━━━━━━━━━━━━━━━━━━━━━━━
*ᴄʀᴇᴀᴛᴇᴅ ʙʏ⁴³²👨🏻‍💻*
*┌─〈  〉─◆*
*│╭─────────────···▸*
*❖│▸* *ʀᴜɴᴛɪᴍᴇ* : ${runtime(process.uptime())}
*❖│▸* *ʀᴀᴍ ᴜsᴇ* : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
*❖│▸* *ɴᴀᴍᴇ ʙᴏᴛ* : **Silent-Sobx-MD**
*❖│▸* *ᴄʀᴇᴀᴛᴏʀ* : **Silent Lover**
*❖│▸* *ᴠᴇʀsɪᴏɴs* : *ᴠ.2.0.0*
*❖│▸* *ᴍᴇɴᴜ ᴄᴍᴅ* : *ᴍᴇɴᴜ ʟɪsᴛ*
*❖│▸* *ꜱᴜʙꜱᴄʀɪʙᴇ ᴍʏ ʏᴛ ᴄʜᴀɴɴᴇʟ* : **
*❖│▸* *ᴊᴏɪɴ ᴍʏ ᴄʜᴀɴɴᴇʟ* : 
*┬│▸*
*│╰────────────···▸▸*
*└──────────────···▸*
*♡︎•━━━━━━☻︎━━━━━━•♡︎*

┏━━━━━━━━━━━━━━━
*📥 DOWNLOADER-CMD 📥*
┡────────────────
*🧩 Search Cmd:* .search
*💾 File Downloader:* download URL
*🎥 Movie Download:* movie  MovieName
└────────────────

┏━━━━━━━━━━━━━━━
*🔎 SEARCH-CMD 🔍*
┡────────────────
*📚 Search Info:* search [term]
*🖼️ Image Search:* image [query]
*🎬 Video Search:* video [query]
└────────────────

┏━━━━━━━━━━━━━━━
*🧠 AI-CMD 🧠*
┡────────────────
*🤖 Chat with AI:* chat
*💡 Ask AI Anything:* ask [question]
└────────────────

┏━━━━━━━━━━━━━━━
*👨‍💻 OWNER-CMD 👨‍💻*
┡────────────────
*⚙️ Bot Info:* info
*🔧 Settings:* settings
└────────────────

┏━━━━━━━━━━━━━━━
*👥 GROUP-CMD 👥*
┡────────────────
*👤 Group Info:* .groupinfo
*🎤 Manage Group:* .group [add/remove]
└────────────────

┏━━━━━━━━━━━━━━━
*📃 INFO-CMD 📃*
┡────────────────
*🧑‍💻 Developer Info:* .devinfo
*ℹ️ Bot Info:* .botinfo
└────────────────

*╭─────────*
*│ ᴘᴏᴡᴇʀᴇᴅ ʙʏ sɪʟᴇɴᴛ-sᴏʙx-ᴍᴅ*
*╰─────────*
`;

        await conn.sendMessage(from, { image: { url: config.ALIVE_IMG }, caption: madeMenu }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
