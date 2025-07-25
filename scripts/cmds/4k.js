const axios = require("axios");

async function getApiUrl() {
 try {
 const { data } = await axios.get("https://raw.githubusercontent.com/romeoislamrasel/romeobot/refs/heads/main/api.json");
 return data.api; 
 } catch (error) {
 console.error("Error fetching API URL:", error);
 return null;
 }
}

module.exports = {
 config: {
 name: "4k",
 aliases: ["upscale"],
 version: "1.2",
 role: 0,
 author: "Romeo",
 countDown: 5,
 longDescription: "Upscale images to 4K resolution.",
 category: "image",
 guide: {
 en: "${pn} reply to an image to upscale it to 4K resolution."
 }
 },

 onStart: async function ({ message, event }) {
 if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
 return message.reply("⚠️ Please reply to an image to upscale it.");
 }

 const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
 const apiBase = await getApiUrl();
 if (!apiBase) {
 return message.reply("❌ Could not get the API URL. Please try again later.");
 }

 const upscaleUrl = `${apiBase}/api/upscale?imgurl=${imgurl}`;

 message.reply("🔄 Processing your image... Please wait.", async (err, info) => {
 try {
 const { data } = await axios.get(upscaleUrl);
 const upscaledImageUrl = data.upscaled;

 if (!upscaledImageUrl) {
 return message.reply("❌ Failed to upscale the image. Please try again later.");
 }

 const attachment = await global.utils.getStreamFromURL(upscaledImageUrl, "upscaled-image.png");

 await message.reply({
 body: "✅ Here is your 4K upscaled image:",
 attachment: attachment
 });

 message.unsend(info.messageID);

 } catch (error) {
 console.error(error);
 message.reply("❌ There was an error upscaling your image.");
 }
 });
 }
};