const cron = require("node-cron")
const scheduledJobs = {}

/**
 * Schedule a daily message for a guild
 * @param {Client} client Discord.js client
 * @param {string} guildId Guild ID
 * @param {string} channelId Channel ID
 * @param {number} hour 0-23
 * @param {number} minute 0-59
 * @param {Array<string>} skipDates Array of YYYY-MM-DD to skip
 */
function scheduleMessage(client, guildId, channelId, hour, minute, skipDates = []) {
    // Cancel previous job if exists
    if (scheduledJobs[guildId]) scheduledJobs[guildId].stop()

    const cronTime = `${minute} ${hour} * * *`
    const job = cron.schedule(cronTime, async () => {
        const today = new Date().toISOString().split("T")[0]
        if (skipDates.includes(today)) return // Skip exceptions

        try {
            const channel = await client.channels.fetch(channelId)
            const message = await channel.send("@everyone Please like this message if you were at practice today!")
            await message.react("👍")
            console.log(`Scheduled message sent in guild ${guildId} on ${today}`)
        } catch (err) {
            console.error("Error sending scheduled message:", err)
        }
    })

    scheduledJobs[guildId] = job
}

module.exports = { scheduleMessage }
