          const mineflayer = require('mineflayer');
          const http = require('http');

          // 1. WEB SERVER GIỮ BOT ONLINE
          http.createServer((req, res) => {
              res.writeHead(200, { 'Content-Type': 'text/plain' });
              res.end('Bot Army is running!');
          }).listen(process.env.PORT || 10000);

          const config = {
              host: "darkblademc.joinmc.world",
              port: 20674,
              version: "1.21.1",
              password: "matkhauchung123"
          };

          const MAX_BOTS = 5; 

          function createBot(index) {
              const botName = `SuperBot_${index}`;
              const bot = mineflayer.createBot({
                  host: config.host,
                  port: config.port,
                  username: botName,
                  version: config.version,
                  hideErrors: true
              });

              bot.on('spawn', () => {
                  console.log(`[${botName}] ✅ Đã vào đội hình!`);
                  setTimeout(() => {
                      bot.chat(`/register ${config.password} ${config.password}`);
                      bot.chat(`/login ${config.password}`);
                  }, 2000);

                  const actionInterval = setInterval(() => {
                      if (!bot.entity) return;
                      const r = Math.random();
                      if (r < 0.5) {
                          bot.setControlState('jump', true);
                          setTimeout(() => bot.setControlState('jump', false), 500);
                      } else {
                          bot.chat(`Checking server status... [AFK Bot #${index}]`);
                      }
                  }, 15000 + (index * 1000));

                  setTimeout(() => {
                      clearInterval(actionInterval);
                      bot.quit();
                  }, 1200000);
              });

              bot.on('end', () => {
                  console.log(`[${botName}] ❌ Thoát. Hồi sinh sau 30s...`);
                  setTimeout(() => createBot(index), 30000);
              });

              bot.on('error', (err) => console.log(`[${botName}] Lỗi: ${err.message}`));
          }

          // Chạy vòng lặp khởi tạo bot
          for (let i = 1; i <= MAX_BOTS; i++) {
              setTimeout(() => {
                  createBot(i);
              }, i * 15000);
          }
