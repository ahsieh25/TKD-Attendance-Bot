const { doc } = require("./client")

function parseSchedule(dateValue, timeValue) {
    if (!dateValue || !timeValue) {
        throw new Error("Missing date or time")
    }

    let month, day, year

    // Handle Google Sheets Date objects
    if (dateValue instanceof Date) {
        month = dateValue.getMonth() + 1
        day = dateValue.getDate()
        year = dateValue.getFullYear()
    } else {
        const parts = String(dateValue).split("/")
        if (parts.length !== 3) {
            throw new Error("Invalid date format")
        }
        month = Number(parts[0])
        day = Number(parts[1])
        year = Number(parts[2]) < 100 ? 2000 + Number(parts[2]) : Number(parts[2])
    }

    const [hour, minute] = String(timeValue).split(":").map(Number)

    const dateObj = new Date(year, month - 1, day, hour, minute, 0, 0)

    if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date object")
    }

    return dateObj
}


async function getSchedules() {
    await doc.loadInfo()
    const sheet = doc.sheetsByTitle["Schedules"]
    if (!sheet) throw new Error("Missing 'Schedules' sheet")

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
