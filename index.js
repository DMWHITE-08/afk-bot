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

        const actions = ['forward', 'back', 'left', 'right']
        const action = actions[Math.floor(Math.random() * actions.length)]

        bot.setControlState(action, true)
        bot.setControlState('jump', true)

        setTimeout(() => {
            bot.clearControlStates()
        }, 2000)

    }, 10000)
})

bot.on('end', () => {
    console.log('Disconnected, reconnecting...')
    setTimeout(createBot, 5000)
})

bot.on('error', err => console.log(err))
}

createBot()
