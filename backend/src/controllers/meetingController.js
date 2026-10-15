import meetingModel from "../models/meetingModel.js";

export const createMeeting = async (req, res) => {
    const userId = req.user;
    const meeting = await meetingModel.create({ users: [userId], geoTracks: [{ userId, cordinates: { x: 0, y: 0 } }], admin: userId });

    res.status(201).json({
        message: "Meeting has been created",
        success: true,
        meeting
    })
}

export const getMeetingUsers = async (req, res) => {
    const { meetingId } = req.params;

    if (!meetingId) return res.status(400).json({
        message: "MeetingId is required",
        success: false,
    })

    const meeting = await meetingModel.findById(meetingId).populate('users');

    if (!meeting) return res.status(404).json({
        message: "Meeting does not exist",
        success: false
    })

    res.status(200).json({
        message: `Fetched all users from meeting with meetingId: ${meetingId}`,
        success: true,
        users: meeting.users

    })

}