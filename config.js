let attendanceChannelId = process.env.CHANNEL_ID

function setAttendanceChannel(id) {
    attendanceChannelId = id
}

function getAttendanceChannel() {
    return attendanceChannelId
}

module.exports = { setAttendanceChannel, getAttendanceChannel }
