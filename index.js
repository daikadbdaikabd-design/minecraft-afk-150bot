const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: "191.96.231.27",
    port: 10570,
    username: "Anh_Nho_BloxFruit",
    version: "1.20.1"
  })

  bot.on("login", () => {
    console.log("Bot đã login server")
  })

  bot.on("spawn", () => {

    console.log("Bot đã vào world")

    // chống AFK
    setInterval(() => {

      if (!bot.entity) return

      bot.setControlState("jump", true)

      setTimeout(() => {
        bot.setControlState("jump", false)
      }, 300)

    }, 5000)

  })

  bot.on("messagestr", (msg) => {

    if (msg.includes("/register")) {
      bot.chat("/register thien24092012 thien24092012")
    }

    if (msg.includes("/login")) {
      bot.chat("/login thien24092012")
    }

  })

  bot.on("kicked", (reason) => {
    console.log("Bot bị kick:", reason)
  })

  bot.on("error", (err) => {
    console.log("Lỗi:", err.message)
  })

  bot.on("end", () => {

    console.log("Bot mất kết nối, reconnect sau 30s...")

    setTimeout(() => {
      startBot()
    }, 30000)

  })

}

startBot()

// web server cho UptimeRobot
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Web server chạy port", PORT)
})
