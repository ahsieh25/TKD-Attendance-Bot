const { logAttendance } = require("./sheets/attendance")
const { getAttendanceChannel } = require("./config")

const scheduledTimes = new Set()
const sentMessages = new Map()
let scheduledTimeouts = []   // <-- track active timeouts

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

    // Skip past dates
    if (delay <= 0) return

    // Too far in the future → wait for daily reload
    if (delay > MAX_TIMEOUT) {
        console.log("Schedule too far out, will be picked up later:", runAt)
        return
    }

    if (scheduledTimes.has(runAt.getTime())) return
    scheduledTimes.add(runAt.getTime())

    const timeout = setTimeout(async () => {
        try {
            const channelId = getAttendanceChannel()
            if (!channelId) return

            const channel = await client.channels.fetch(channelId)
            const msg = await channel.send("@everyone Please like this message if you were at practice today!")
            await msg.react("👍")

            msg.sentAt = new Date(runAt)
            sentMessages.set(msg.id, new Set())
        } catch (err) {
            console.error(err)
        }
    }, delay)

    scheduledTimeouts.push(timeout)   // <-- store it
}

function loadSchedules(client, dates) {
    clearSchedules()                 // <-- THIS is the key fix

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
