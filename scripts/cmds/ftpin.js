const fs = require("fs-extra");
const path = require("path");
const ftp = require("basic-ftp");

const FTP_CONFIG = {
  host: "ftpupload.net",
  user: "cpfr_39361582",
  password: "chitron@2448766",
  secure: false,
  port: 21
};

module.exports = {
  config: {
    name: "ftpin",
    version: "1.0",
    author: "Chitron Bhattacharjee",
    countDown: 5,
    role: 2,
    shortDescription: { en: "📥 Install or update a cmd from FTP" },
    description: {
      en: "Install or update any .js file directly into /cmds from your FTP server 🌐"
    },
    category: "tools",
    guide: {
      en:
        "🔹 Usage:\n" +
        "➤ +ftpin check.js\n" +
        "📁 Must exist in FTP `htdocs/store` folder\n" +
        "🧠 Updates if already exists in cmds"
    }
  },

  onStart: async function ({ message, args }) {
    const filename = args[0];
    if (!filename || !filename.endsWith(".js")) {
      return message.reply("❗ | Please provide a valid `.js` filename to install.");
    }

    const client = new ftp.Client();
    const remotePath = `htdocs/store/${filename}`;
    const localPath = path.join(__dirname, "..", "cmds", filename);

    try {
      await client.access(FTP_CONFIG);
      const tempPath = path.join(__dirname, "cache", filename);
      await fs.ensureDir(path.dirname(tempPath));
      await client.downloadTo(tempPath, remotePath);

      const prevExists = await fs.pathExists(localPath);
      await fs.copy(tempPath, localPath);
      await fs.remove(tempPath);

      return message.reply(
        `✅ | \`${filename}\` ${prevExists ? "updated" : "installed"} in /cmds folder successfully 🌸`
      );
    } catch (err) {
      return message.reply("🚫 | FTP download failed: " + err.message);
    } finally {
      client.close();
    }
  }
};
