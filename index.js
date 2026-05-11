const mineflayer = require('mineflayer')

function startBot() {

const bot = mineflayer.createBot({
    host: 'maincraftandme.aternos.me',
    port: 25565,
    username: 'AFK_Bot',
    auth: 'offline',
    version: false,
    keepAlive: true,
    checkTimeoutInterval: 120000
})

bot.on('spawn', () => {
    console.log('Bot joined successfully')

    setInterval(() => {

        // Rotate head randomly
        bot.look(Math.random() * Math.PI * 2, 0, true)

        // Small anti-afk movement
        bot.setControlState('jump', true)

        setTimeout(() => {
            bot.setControlState('jump', false)
        }, 500)

    }, 10000)
})

bot.on('end', () => {
    console.log('Disconnected. Reconnecting in 10 seconds...')
    setTimeout(startBot, 10000)
})

bot.on('kicked', reason => {
    console.log('Kicked:', reason)
})

bot.on('error', err => {
    console.log('Error:', err)
})
}

startBot()
