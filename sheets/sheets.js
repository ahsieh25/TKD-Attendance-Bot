

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


