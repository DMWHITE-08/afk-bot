const mineflayer = require('mineflayer')

function startBot() {

const bot = mineflayer.createBot({
    host: 'maincraftandme.aternos.me',
    port: 29449,
    username: 'AFK_Bot',
    auth: 'offline',
    version: false,
    keepAlive: true,
    checkTimeoutInterval: 120000
})

bot.on('spawn', () => {
    console.log('Bot joined successfully')

    setInterval(() => {

        // Move forward
        bot.setControlState('forward', true)

        setTimeout(() => {

            bot.setControlState('forward', false)

            // Move backward
            bot.setControlState('back', true)

            setTimeout(() => {

                bot.setControlState('back', false)

                // Small jump
                bot.setControlState('jump', true)

                setTimeout(() => {
                    bot.setControlState('jump', false)
                }, 500)

            }, 2000)

        }, 2000)

    }, 8000)

})

bot.on('end', () => {
    console.log('Disconnected. Reconnecting in 10s...')
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
