const { doc } = require("./client")

function parseSchedule(dateValue, timeValue) {
    const datePart = dateValue
    const timePart = timeValue
    if (!datePart || !timePart) throw new Error(`Invalid schedule format`)
        
    const [month, day, year] = datePart.split("/").map(Number)
    const [hour, minute] = timePart.split(":").map(Number)

    const fullYear = year < 100 ? 2000 + year : year
    const dateObj = new Date(fullYear, month - 1, day, hour, minute, 0, 0)
    if (isNaN(dateObj.getTime())) throw new Error(`Invalid schedule date`)
    return dateObj
}


async function getSchedules() {
    await doc.loadInfo()
    const sheet = doc.sheetsByTitle["Schedules"]
    if (!sheet) throw new Error("Missing 'Schedules' sheet")
    await sheet.loadCells()
    const rows = await sheet.getRows()
    const schedules = []

    for (const row of rows) {
        const dateValue = row._rawData[0]
        const timeValue = row._rawData[1]
        if (!dateValue || !timeValue) continue

        try {
            schedules.push(parseSchedule(dateValue, timeValue))
        } catch (err) {
            console.warn("Skipping invalid schedule:", dateValue, timeValue)
        }
    }

    return schedules
}

module.exports = { getSchedules }
