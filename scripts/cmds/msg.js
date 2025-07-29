const axios = require("axios");

module.exports = {
	config: {
		name: "message",
		version: "1.4",
		author: "Chitron Bhattacharjee",
		countDown: 5,
		role: 1,
		aliases: ["msg"],
		shortDescription: {
			en: "Send SMS (max 160 chars, cost 100 coins)"
		},
		description: {
			en: "Send SMS max 160 characters, shows char count, deducts 100 coins per send"
		},
		category: "utility",
		guide: {
			en: "+message <number> <text>\n+msg <number> <text>\nMax 160 characters allowed\nCosts 100 coins"
		}
	},

	onStart: async function ({ message, args, event, usersData }) {
		const number = args[0];
		const text = args.slice(1).join(" ");

		if (!number || !text) {
			return message.reply("❌ | Please provide number and message.\n📌 Example: +message 01316655254 New tution পাইছি");
		}

		if (text.length > 160) {
			return message.reply(`❌ | Message too long! Maximum allowed is 160 characters.\n📝 Your message length: ${text.length}`);
		}

		const userData = await usersData.get(event.senderID);
		const currentCoin = userData.money || 0;

		if (currentCoin < 100) {
			return message.reply(`❌ | You need at least 100 coins to use this command.\n💰 Your balance: ${currentCoin}`);
		}

		try {
			const url = `http://exbomber.ct.ws/sms.php?api=true&number=${encodeURIComponent(number)}&message=${encodeURIComponent(text)}`;
			await axios.get(url);

			await usersData.set(event.senderID, {
				money: currentCoin - 100
			});

			return message.reply(`✅ | Message sent to ${number}!\n💬 Text: ${text}\n✍️ Character count: ${text.length}/160\n💸 100 coins deducted.\n💰 Balance left: ${currentCoin - 100}`);
		} catch (e) {
			console.error(e);
			return message.reply("❌ | Failed to send message. API error or invalid number.");
		}
	}
};
