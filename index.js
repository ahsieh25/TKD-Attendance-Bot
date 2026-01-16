require("dotenv").config()
const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js")
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
]})

const { initSheets } = require("./sheets/client")
const { getSchedules } = require("./sheets/schedules")
const { logAttendance } = require("./sheets/attendance")
const { setAttendanceChannel, getAttendanceChannel } = require("./config")
const cron = require("node-cron")
const { checkAndSendSchedules, sentMessages} = require("./scheduler")

// Bot Ready
client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user.tag}`)
    await initSheets()

    // Load schedules on startup
    const schedules = await getSchedules()
    checkAndSendSchedules(client, schedules)
    console.log(`Loaded ${schedules.length} schedules`)

    // Register commands
    await client.application.commands.set([
        new SlashCommandBuilder()
            .setName("reload")
            .setDescription("Reload schedules from Google Sheets"),
        new SlashCommandBuilder()
            .setName("setchannel")
            .setDescription("Set this channel as the attendance channel")
    ])
    console.log("Commands registered")
})

// Reaction Handling
client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return
    if (reaction.partial) await reaction.fetch()
    if (reaction.emoji.name !== "👍") return

    const msg = reaction.message
    if (!sentMessages.has(msg.id)) return

    const member = await msg.guild.members.fetch(user.id)
    const usersSet = sentMessages.get(msg.id)
    if (usersSet.has(user.id)) return

    usersSet.add(user.id)
    const attendanceDate = msg.sentAt || new Date()
    await logAttendance(member.displayName, attendanceDate)
})

// Command Handling
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return

    if (interaction.commandName === "reload") {
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply("You must be an admin to run this command.")
        }

        try {
            const schedules = await getSchedules()
            checkAndSendSchedules(client, schedules)
            interaction.reply(`Reloaded ${schedules.length} schedules.`)
        } catch (err) {
            console.error(err)
            interaction.reply("Failed to reload schedules: " + err.message)
        }
    }

    if (interaction.commandName === "setchannel") {
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply("You must be an admin to run this command.")
        }

        const channelId = interaction.channelId
        setAttendanceChannel(channelId)
        interaction.reply(`This channel has been set as the attendance channel.`)
        console.log(`Attendance channel set to ${channelId}`)
    }
})

client.login(process.env.DISCORD_TOKEN)

// Automatic Reschedule

cron.schedule("*/5 * * * *", async () => {
  try {
    const schedules = await getSchedules()
    await checkAndSendSchedules(client, schedules)

    console.log(
      `[${new Date().toLocaleString()}] Schedule check complete.`
    )
  } catch (err) {
    console.error("Schedule check failed:", err)
  }
})


const express = require("express")
const app = express()
const PORT = process.env.PORT

app.get("/", (req, res) => res.send("Bot is running!"))

app.listen(PORT, () => console.log(`HTTP server listening on port ${PORT}`))