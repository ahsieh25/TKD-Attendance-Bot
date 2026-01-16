const { logAttendance } = require("./sheets/attendance")
const { getAttendanceChannel } = require("./config")

const scheduledTimes = new Set()
const sentMessages = new Map()
let scheduledTimeouts = []

const MAX_TIMEOUT = 1_000_000_000

function clearSchedules() {
    console.log("Clearing existing schedules...")

    for (const timeout of scheduledTimeouts) {
        clearTimeout(timeout)
    }

    scheduledTimeouts = []
    scheduledTimes.clear()
}

function scheduleOnce(client, runAt) {
    const delay = runAt - Date.now()
    if (delay <= 0) return

    // Too far in the future
    if (delay > MAX_TIMEOUT) {
        return
    }

    console.log("Scheduling for:", runAt.toString(), "Delay:", delay)

    if (scheduledTimes.has(runAt.getTime())) return
    scheduledTimes.add(runAt.getTime())

    const timeout = setTimeout(async () => {
    try {
        const channelId = getAttendanceChannel()
        console.log("Scheduling message in channel:", channelId, "at", new Date(runAt))
        if (!channelId) return console.warn("No attendance channel set!")
        const channel = await client.channels.fetch(channelId)
        const msg = await channel.send("@everyone Please like this message if you were at practice today!")
        console.log("Message sent, ID:", msg.id)
        await msg.react("👍")
        msg.sentAt = new Date(runAt)
        sentMessages.set(msg.id, new Set())
    } catch (err) {
        console.error("Failed to send attendance message:", err)
    }
}, delay)


    scheduledTimeouts.push(timeout)
}

function loadSchedules(client, dates) {
    clearSchedules()
    scheduleOnce(client, new Date(Date.now() + 10_000))
    dates.forEach(runAt => scheduleOnce(client, runAt))

    console.log("Total active schedules:", scheduledTimeouts.length)
}

module.exports = { 
    loadSchedules, 
    scheduleOnce, 
    scheduledTimes, 
    sentMessages 
}
