const mineflayer = require("mineflayer");
const express = require("express");

const config = {
  host: "darkblademc.joinmc.world",
  port: 20674,
  version: "1.20.1",
  password: "bot123",
  count: 150, // Số lượng bot
  reconnectDelay: 15000, // 15 giây
  loginDelay: 2000 // Cách 2 giây vào 1 con để tránh bị Proxy block
};

const bots = [];

function createBot(index) {
  const username = `_HuuThien_${index}`; // Tạo tên bot theo số thứ tự
  
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: username,
    version: config.version,
    // Tối ưu: Tắt tính toán vật lý để chạy được 150 con không lag máy
    checkTimeoutInterval: 60000,
    physicsEnabled: false 
  });

  bot.on("spawn", () => {
    console.log(`[+] ${username} đã vào server.`);

    // Thực hiện login/register
    setTimeout(() => bot.chat(`/login ${config.password}`), 3000);
    setTimeout(() => bot.chat(`/register ${config.password} ${config.password}`), 5000);

    // Hành động AFK: Nhảy và quay mặt ngẫu nhiên
    setInterval(() => {
      if (!bot.entity) return;
      bot.setControlState("jump", true);
      bot.look(Math.random() * Math.PI * 2, 0);
      setTimeout(() => bot.setControlState("jump", false), 200);
    }, 5000); // Tăng lên 5s để tránh spam packet quá nhanh
  });

  bot.on("chat", (username, message) => {
    if (message.includes("/login")) bot.chat(`/login ${config.password}`);
  });

  bot.on("error", (err) => console.log(`[!] Lỗi ${username}: ${err.message}`));

  bot.on("end", () => {
    console.log(`[-] ${username} thoát. Đang kết nối lại...`);
    setTimeout(() => createBot(index), config.reconnectDelay);
  });
}

// Hàm khởi chạy toàn bộ bot với độ trễ để tránh bị khóa IP ngay lập tức
async function startSpam() {
  for (let i = 1; i <= config.count; i++) {
    createBot(i);
    await new Promise(res => setTimeout(res, config.loginDelay));
  }
}

startSpam();

// --- Web Server giữ Hosting ---
const app = express();
app.get("/", (req, res) => res.send("Bot System Running"));
app.listen(process.env.PORT || 3000);
