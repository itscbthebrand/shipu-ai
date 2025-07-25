const fs = require("fs-extra");
const path = require("path");
const https = require("https");

module.exports = {
 config: {
 name: "preview", // ✅ Command name updated
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 0,
 shortDescription: { en: "Preview media from link" },
 description: { en: "Send preview of direct image/video/audio links" },
 category: "tools",
 guide: { en: "+preview <media link>\nOr reply to a link with 'preview'" }
 },

 onStart: async function ({ message, args, event }) {
 const url = args[0] || event.messageReply?.body;
 if (!url || !isValidMediaLink(url))
 return message.reply("❌ Please provide or reply to a valid media link.");
 return handleMediaDownload(url, message);
 },

 onChat: async function ({ event, message }) {
 const body = event.body?.toLowerCase();
 const replyText = event.messageReply?.body;

 if (body === "preview" && replyText && isValidMediaLink(replyText)) {
 return handleMediaDownload(replyText, message);
 }

 // direct message with just media link
 if (isValidMediaLink(event.body)) {
 return handleMediaDownload(event.body, message);
 }
 }
};

function isValidMediaLink(url) {
 return /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|mp4|mp3|webm|wav|m4a))/i.test(url);
}

function getFileExtension(url) {
 const match = url.match(/\.(jpg|jpeg|png|gif|mp4|mp3|webm|wav|m4a)/i);
 return match ? match[1] : "dat";
}

async function handleMediaDownload(url, message) {
 try {
 const ext = getFileExtension(url);
 const fileName = `preview.${ext}`;
 const filePath = path.join(__dirname, "cache", fileName);

 if (!fs.existsSync(path.join(__dirname, "cache"))) {
 fs.mkdirSync(path.join(__dirname, "cache"));
 }

 await downloadFile(url, filePath);

 message.reply({
 body: `📤 𝗬𝗼𝘂𝗿 𝗺𝗲𝗱𝗶𝗮 𝗳𝗶𝗹𝗲 𝗶𝘀 𝗿𝗲𝗮𝗱𝘆 🤍`,
 attachment: fs.createReadStream(filePath)
 }, () => fs.unlinkSync(filePath));
 } catch (err) {
 console.error(err);
 message.reply("❌ Failed to preview the media.");
 }
}

function downloadFile(url, dest) {
 return new Promise((resolve, reject) => {
 const file = fs.createWriteStream(dest);
 https.get(url, response => {
 if (response.statusCode !== 200) return reject("Failed to fetch media");
 response.pipe(file);
 file.on("finish", () => file.close(resolve));
 }).on("error", err => {
 fs.unlink(dest, () => reject(err.message));
 });
 });
}