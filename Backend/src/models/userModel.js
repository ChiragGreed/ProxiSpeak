import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    avtar: {
        type: String, //url
        required: true,
        default: 'https://i.pinimg.com/736x/32/f9/c0/32f9c027d139b958f79b2793d01e5df9.jpg'
    }
})

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

const userModel = new mongoose.model('users', userSchema);

export default userModel;