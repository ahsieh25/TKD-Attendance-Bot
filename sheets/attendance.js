const { doc } = require("./client")

function formatDateMMDDYY(date) {
    if (!(date instanceof Date)) date = new Date(date)
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    const yy = String(date.getFullYear() % 100).padStart(2, "0")
    return `${mm}/${dd}/${yy}`
}

async function logAttendance(name, date) {
    const sheet = doc.sheetsByTitle["Attendance"]
    if (!sheet) throw new Error("Missing 'Attendance' sheet")
    const formattedDate = formatDateMMDDYY(date)
    await sheet.addRow({ Date: formattedDate, Name: name })
}

module.exports = { logAttendance }
