const { GoogleSpreadsheet } = require("google-spreadsheet")
const { JWT } = require("google-auth-library")

// Google Sheet integration
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)

const auth = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth)

async function init() {
    await doc.loadInfo()
}

async function addToSheet(username) {
    try {
        const sheet = doc.sheetsByTitle["Attendance"]
        if (!sheet) throw new Error("Sheet tab 'Attendance' not found")
        const date = new Date().toISOString().split("T")[0]
        await sheet.addRow({Date: date, Name: username})
        console.log("Sheet write successful")
    } catch (err) {
        console.error("Sheet write failed:", err)
    }
}

module.exports = { init, addToSheet }
