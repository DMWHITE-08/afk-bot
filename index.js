const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: 'maincraftandme.aternos.me',
  port: 29449,
  username: 'AFK_Bot',
  auth: 'offline'
})

bot.on('spawn', () => {
  console.log('Bot joined')

  setInterval(() => {
    bot.setControlState('jump', true)

    setTimeout(() => {
      bot.setControlState('jump', false)
    }, 500)
  }, 30000)
})
