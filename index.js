const mineflayer = require('mineflayer')

function createBot() {

const bot = mineflayer.createBot({
    host: 'maincraftandme.aternos.me',
    port: 29449,
    username: 'AFK_Bot',
    auth: 'offline'
})

bot.on('spawn', () => {
    console.log('Bot joined')

    setInterval(() => {

        bot.look(Math.random() * Math.PI * 2, 0, true)

        bot.setControlState('jump', true)

        setTimeout(() => {
            bot.setControlState('jump', false)
        }, 500)

    }, 10000)
})

bot.on('end', () => {
    console.log('Disconnected, reconnecting...')
    setTimeout(createBot, 5000)
})

bot.on('error', err => console.log(err))
}

createBot()
