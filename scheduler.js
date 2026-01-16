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
        console.log("Schedule too far out, will be picked up later:", runAt)
        return
    }

    if (scheduledTimes.has(runAt.getTime())) return
    scheduledTimes.add(runAt.getTime())

    const timeout = setTimeout(async () => {
    try {
        const channelId = getAttendanceChannel()
        console.log("Scheduling message in channel:", channelId, "at", new Date(runAt))
        if (!channelId) return console.warn("No attendance channel set!")

        const channel = await client.channels.fetch(channelId)
        console.log("Fetched channel:", channel.name)

        const msg = await channel.send("@everyone Please like this message if you were at practice today!")
        console.log("Message sent, ID:", msg.id)

        await msg.react("👍")
        console.log("Reaction added")

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

    console.log("Loading schedules:", dates)

    dates.forEach(runAt => scheduleOnce(client, runAt))

    console.log("Total active schedules:", scheduledTimeouts.length)
}

module.exports = { 
    loadSchedules, 
    scheduleOnce, 
    scheduledTimes, 
    sentMessages 
}
