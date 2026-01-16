const { getAttendanceChannel } = require("./config")

const sentMessages = new Map()

// Tracks which schedule times have already been sent
const sentScheduleTimes = new Set()

/**
 * Checks schedules and sends messages if within time window
 */
async function checkAndSendSchedules(client, schedules) {
  const now = Date.now()
  const WINDOW = 2 * 60 * 1000 // 2 minutes

  for (const runAt of schedules) {
    const diff = Math.abs(runAt - now)

    // Only trigger close to scheduled time
    if (diff <= WINDOW) {
      if (sentScheduleTimes.has(runAt.getTime())) {
        console.log("Already sent for:", runAt)
        continue
      }

      console.log("Sending attendance message for:", runAt)

      sentScheduleTimes.add(runAt.getTime())

      try {
        const channelId = getAttendanceChannel()
        if (!channelId) {
          console.warn("No attendance channel set!")
          return
        }

        const channel = await client.channels.fetch(channelId)

        const msg = await channel.send(
          "@everyone Please like this message if you were at practice today!"
        )

        await msg.react("👍")

        msg.sentAt = new Date(runAt)
        sentMessages.set(msg.id, new Set())

        console.log("Attendance message sent. ID:", msg.id)
      } catch (err) {
        console.error("Failed to send attendance message:", err)
      }
    }
  }
}

/**
 * Clears old sent schedule records (optional cleanup)
 */
function clearSentSchedules() {
  sentScheduleTimes.clear()
  console.log("Cleared sent schedule history")
}

module.exports = {
  checkAndSendSchedules,
  clearSentSchedules,
  sentMessages
}
