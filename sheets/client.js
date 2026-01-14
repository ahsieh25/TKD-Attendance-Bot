const { GoogleSpreadsheet } = require("google-spreadsheet")
const { GoogleAuth } = require("google-auth-library")

const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
})

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth)

async function initSheets() {
    await doc.loadInfo()
    console.log("Google Sheets loaded")
}

module.exports = { doc, initSheets }
