const mineflayer = require("mineflayer");
const { SocksProxyAgent } = require("socks-proxy-agent");
const express = require("express");

// --- CẤU HÌNH ---
const SERVER = {
  host: "darkblademc.joinmc.world",
  port: 20674,
  version: "1.20.1",
  password: "bot123",
  count: 150
};

// --- DANH SÁCH PROXY (Dán list proxy SOCKS5 của bạn vào đây) ---
// Định dạng: 'socks5://ip:port' hoặc 'socks5://user:pass@ip:port'
const proxies = [
  // 'socks5://103.123.456.1:1080',
  // 'socks5://103.123.456.2:1080',
];

function startBot(id) {
  const username = `_HuuThien_${id}`;

  // Chọn proxy xoay vòng từ danh sách
  const proxy = proxies.length > 0 ? proxies[id % proxies.length] : null;
  const agent = proxy ? new SocksProxyAgent(proxy) : null;

  const bot = mineflayer.createBot({
    host: SERVER.host,
    port: SERVER.port,
    username: username,
    version: SERVER.version,
    agent: agent, // Đây là "tấm khiên" để không bị trùng IP
    physicsEnabled: false, // Tắt vật lý để Render không bị nổ RAM
  });

  bot.once("spawn", () => {
    console.log(`[+] ${username} đã vào server thành công.`);

    // Auto Login/Register
    setTimeout(() => bot.chat(`/register ${SERVER.password} ${SERVER.password}`), 3000);
    setTimeout(() => bot.chat(`/login ${SERVER.password}`), 5000);

    // Hành động AFK
    setInterval(() => {
      if (bot.entity) {
        bot.setControlState("jump", true);
        bot.look(Math.random() * 6.2, 0);
        setTimeout(() => bot.setControlState("jump", false), 200);
      }
    }, 10000);
  });

  // Xử lý khi bị văng (do Anti-bot hoặc Lag)
  bot.on("end", (reason) => {
    // Không hiện log đỏ nếu chỉ là ngắt kết nối thông thường
    if (reason !== 'socketClosed') {
        console.log(`[-] ${username} thoát: ${reason}. Thử lại sau 15s...`);
    }
    setTimeout(() => startBot(id), 15000);
  });

  bot.on("error", (err) => {
    // Chỉ hiện lỗi quan trọng, tránh spam log ECONNRESET
    if (err.code !== 'ECONNRESET') {
        console.log(`[!] Lỗi ${username}: ${err.message}`);
    }
  });
}

// Khởi động bot từ từ để tránh bị "sốc" hệ thống
async function run() {
  for (let i = 1; i <= SERVER.count; i++) {
    startBot(i);
    await new Promise(res => setTimeout(res, 2000)); // Nghỉ 2s mỗi con
  }
}

run();

// Giữ cho Render sống
const app = express();
app.get("/", (req, res) => res.send("Hệ thống Bot đang chạy..."));
app.listen(process.env.PORT || 3000);
