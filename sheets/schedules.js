const { doc } = require("./client")

function parseSchedule(cellValue) {
    const [datePart, timePart] = cellValue.split(";").map(s => s.trim())
    if (!datePart || !timePart) throw new Error(`Invalid schedule format: "${cellValue}"`)

    const [month, day, year] = datePart.split("/").map(Number)
    const [hour, minute] = timePart.split(":").map(Number)

    const fullYear = year < 100 ? 2000 + year : year
    const dateObj = new Date(fullYear, month - 1, day, hour, minute, 0, 0)
    if (isNaN(dateObj.getTime())) throw new Error(`Invalid schedule date: "${cellValue}"`)
    return dateObj
}

async function getSchedules() {
    const sheet = doc.sheetsByTitle["Schedules"]
    if (!sheet) throw new Error("Missing 'Schedules' sheet")

    const rows = await sheet.getRows()
    const schedules = []

    for (const row of rows) {
        const cellValue = row._rawData[0] // first column
        if (!cellValue) continue

        try {
            schedules.push(parseSchedule(cellValue))
        } catch (err) {
            console.warn("Skipping invalid schedule:", cellValue)
        }
    }

    return schedules
}

module.exports = { getSchedules }
