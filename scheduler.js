const { logAttendance } = require("./sheets/attendance")

const scheduledTimes = new Set() // prevent duplicate messages
const sentMessages = new Map()   // msg.id -> Set of userIds

function scheduleOnce(client, runAt) {
    const delay = runAt - Date.now()
    if (delay <= 0) return
    if (scheduledTimes.has(runAt.getTime())) return
    scheduledTimes.add(runAt.getTime())

    setTimeout(async () => {
        try {
            const channel = await client.channels.fetch(process.env.CHANNEL_ID)
            const msg = await channel.send("@everyone Please react 👍 if you’re here!")
            await msg.react("👍")
            msg.sentAt = new Date(runAt)
            sentMessages.set(msg.id, new Set())
            console.log("Message sent at", runAt)
        } catch (err) {
            console.error("Error sending scheduled message:", err)
        }
    }, delay)
}

function loadSchedules(client, dates) {
    dates.forEach(runAt => scheduleOnce(client, runAt))
}

module.exports = { loadSchedules, scheduleOnce, scheduledTimes, sentMessages }
