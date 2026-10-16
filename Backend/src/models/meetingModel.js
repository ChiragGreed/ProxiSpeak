import mongoose from "mongoose";

const meetingSchema = mongoose.Schema({
    users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "users",
        required: true,
    },
    geoTracks: {
        type: [Object],
        required: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }
})

const meetingModel = new mongoose.model('meetings', meetingSchema);

export default meetingModel;