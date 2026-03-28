const mineflayer = require("mineflayer");
const express = require("express");
const { SocksProxyAgent } = require("socks-proxy-agent");

// --- CẤU HÌNH ---
const SETTINGS = {
  host: "darkblademc.joinmc.world",
  port: 20674,
  version: "1.20.1",
  password: "bot123",
  botCount: 150,
  prefix: "_HuuThien_",
  loginDelay: 2500, // Nghỉ 2.5s mỗi con để tránh bị kick "Too many logins"
};

// DANH SÁCH PROXY (Nếu không có proxy, 150 con sẽ bị ban IP ngay lập tức)
// Thay bằng proxy của bạn: "socks5://user:pass@ip:port"
const proxies = [
  // "socks5://1.2.3.4:1080", 
];

function createBot(id) {
  const username = `${SETTINGS.prefix}${id}`;
  const proxy = proxies.length > 0 ? proxies[id % proxies.length] : null;
  const agent = proxy ? new SocksProxyAgent(proxy) : null;

  console.log(`[#] Đang kết nối Bot: ${username}...`);

  const bot = mineflayer.createBot({
    host: SETTINGS.host,
    port: SETTINGS.port,
    username: username,
    version: SETTINGS.version,
    agent: agent,
    // TỐI ƯU CỰC MẠNH: Tắt xử lý vật lý để không tốn RAM/CPU
    physicsEnabled: false,
    checkTimeoutInterval: 60000
  });

  // Xử lý khi vào server
  bot.on("spawn", () => {
    console.log(`[√] ${username} đã vào world.`);
    
    // Auto Login / Register
    setTimeout(() => bot.chat(`/register ${SETTINGS.password} ${SETTINGS.password}`), 2000);
    setTimeout(() => bot.chat(`/login ${SETTINGS.password}`), 4000);

    // Vòng lặp Chống AFK (5 giây/lần)
    const afkInterval = setInterval(() => {
      if (!bot.entity) return;
      bot.setControlState("jump", true);
      bot.look(Math.random() * 6, (Math.random() - 0.5));
      setTimeout(() => bot.setControlState("jump", false), 500);
    }, 5000);

    bot.once("end", () => clearInterval(afkInterval));
  });

  // Tự động trả lời nếu server yêu cầu login trong chat
  bot.on("chat", (user, msg) => {
    if (msg.includes("/login")) bot.chat(`/login ${SETTINGS.password}`);
  });

  // Tự động kết nối lại nếu bị văng
  bot.on("end", (reason) => {
    console.log(`[!] ${username} thoát (${reason}). Reconnect sau 20s...`);
    setTimeout(() => createBot(id), 20000);
  });

  bot.on("error", (err) => console.log(`[X] Lỗi ${username}: ${err.message}`));
}

// Hàm khởi chạy hàng loạt
async function startSpam() {
  for (let i = 1; i <= SETTINGS.botCount; i++) {
    createBot(i);
    // Chờ một chút trước khi con tiếp theo vào để tránh nổ log
    await new Promise(resolve => setTimeout(resolve, SETTINGS.loginDelay));
  }
}

startSpam();

// --- WEB SERVER (Để treo trên Render/UptimeRobot) ---
const app = express();
app.get("/", (req, res) => res.send("Bot System is Online!"));
app.listen(process.env.PORT || 3000, () => console.log("Web Server Ready."));
