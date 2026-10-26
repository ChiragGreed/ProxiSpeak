import mongoose from "mongoose";

const geoSpatialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "meetings",
        required: true
    },

    position: {
        x: Number,
        y: Number
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

// One active membership record per user per meeting
geoSpatialSchema.index(
    { userId: 1, meetingId: 1 },
    { unique: true }
);

export default mongoose.model("UserGeoLocation", geoSpatialSchema);