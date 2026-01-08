const { SlashCommandBuilder } = require("discord.js")

const commands = [
    new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("Set a daily message schedule")
        .addIntegerOption(option =>
            option.setName("hour")
                  .setDescription("Hour (0-23)")
                  .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("minute")
                  .setDescription("Minute (0-59)")
                  .setRequired(true)
        )
        // Optional: comma-separated skip dates
        .addStringOption(option =>
            option.setName("skip")
                  .setDescription("Optional skip dates YYYY-MM-DD, separated by commas")
                  .setRequired(false)
        )
]

module.exports = { commands }
