require("dotenv").config()
const express = require("express")
const { Client, GatewayIntentBits, Partials } = require("discord.js")
const { scheduleDailyMessage } = require("./scheduleManager")
const { init, addReaction } = require("./sheets")
const { commands } = require("./commands")

// Express
const app = express()

// Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
    ],
})

init().then(() => console.log("Google Sheets initialized"))

// Bot ready
client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`)

     const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(c => c.toJSON()) }
        )
        console.log("Slash commands registered")
    } catch (err) {
        console.error(err)
    }
})

// Handle scheduling command
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return

    if (interaction.commandName === "schedule") {
        const hour = interaction.options.getInteger("hour")
        const minute = interaction.options.getInteger("minute")
        const skipInput = interaction.options.getString("skip") || ""
        const skipDates = skipInput.split(",").map(s => s.trim()).filter(Boolean)

        scheduleMessage(
            client,
            interaction.guildId,
            interaction.channelId,
            hour,
            minute,
            skipDates
        )

        await interaction.reply(`Schedule set for ${hour}:${minute} daily! Exceptions: ${skipDates.join(", ") || "None"}`)
    }
})

// Reaction handling
client.on("messageReactionAdd", async (reaction, user) => {
    try {
        if (user.bot) return
        if (reaction.partial) await reaction.fetch()

        if (reaction.emoji.name === "👍") {
            const member = await reaction.message.guild.members.fetch(user.id)
            await addToSheet(member.displayName)
        }
    } catch (err) {
        console.error("Reaction handler error:", err)
    }
})

// Keep alive
app.get("/", (req, res) => {
    res.send("Bot running")
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`)
})

client.login(process.env.DISCORD_TOKEN)
