require("dotenv").config()
const { Client, GatewayIntentBits } = require("discord.js")
const { initSheets } = require("./sheets/client")
const { getSchedules } = require("./sheets/schedules")
const { loadSchedules } = require("./scheduler")
const { logAttendance } = require("./sheets/attendance")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
})

client.once("ready", async () => {
    try {
        console.log(`Logged in as ${client.user.tag}`)

        await initSheets()
        const schedules = await getSchedules()
        loadSchedules(client, schedules)

        console.log(`Loaded ${schedules.length} schedules`)
    } catch (err) {
        console.error("Startup failure:", err)
        process.exit(1)
    }
})

const cron = require("node-cron")

// Schedule daily reload at 00:00 (midnight server time)
cron.schedule("0 0 * * *", async () => {
    try {
        const schedules = await getSchedules()
        loadSchedules(client, schedules)
        console.log(`[${new Date().toLocaleString()}] Daily schedule reload complete. Loaded ${schedules.length} schedules.`)
    } catch (err) {
        console.error("Daily schedule reload failed:", err)
    }
})

const { sentMessages } = require("./scheduler")

client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return
    if (reaction.partial) await reaction.fetch()
    if (reaction.emoji.name !== "👍") return

    const msg = reaction.message

    // Only process messages that we sent
    if (!sentMessages.has(msg.id)) return

    const member = await msg.guild.members.fetch(user.id)

    const usersSet = sentMessages.get(msg.id)

    if (usersSet.has(user.id)) {
        // Already logged
        return
    }

    // Mark user as logged for this message
    usersSet.add(user.id)

    // Log attendance using the message's sentAt date
    const attendanceDate = msg.sentAt || new Date()
    await logAttendance(member.displayName, attendanceDate)
})

client.login(process.env.DISCORD_TOKEN)
