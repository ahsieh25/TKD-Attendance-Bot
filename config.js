let attendanceChannelId = null

function setAttendanceChannel(id) {
    attendanceChannelId = id
}

function getAttendanceChannel() {
    return attendanceChannelId
}

module.exports = { setAttendanceChannel, getAttendanceChannel }
