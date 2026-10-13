import mongoose from "mongoose";

const cordinateSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    },
    cordinates: {
        type: Object,
        required: true,
    }
})

const cordinateModel = new mongoose.model('cordinates', cordinateSchema);

export default cordinateModel;