import meetingModel from "../models/meetingModel.js";
import geoSpatialSchema from "../models/geoSpatial.model.js";
import mongoose from "mongoose";

/**
 * @description This create Meeting 
 * @param {userId} req.user 
 * @returns {json}
 */
export const createMeeting = async (req, res) => {
    try{
        const userId = req.user;
        const meeting = await meetingModel.create({ 
            name: userId, 
            admin: userId,
            isActive: true 
        });

        const participant = await geoSpatialSchema.create({ 
            userId, 
            meetingId: meeting._id, 
            position: { 
                x: 0,
                y: 0
            }, 
            isActive: true 
        });
    
        res.status(201).json({
            message: "Meeting has been created",
            success: true,
            meeting,
            participant
        })
    }catch(error) {
        console.error("Create meeting error:", error); 
        return res.status(500).json({ 
            message: "Failed to create meeting", 
            success: false, error: error.message 
        });
    }
}

export const getMeetingDetails = async (req, res) => {
    try{
        const { meetingId } = req.params;
        const userId = req.user;

        if (!meetingId) return res.status(400).json({
            message: "MeetingId is required",
            success: false,
        });

        if (!mongoose.Types.ObjectId.isValid(meetingId)) { 
            return res.status(400).json({ 
                message: "Invalid MeetingId", 
                success: false 
            }); 
        }

        const meeting = await meetingModel.findById(meetingId).populate("admin", "name email");

        if (!meeting) return res.status(404).json({
            message: "Meeting does not exist",
            success: false
        })

        let isUserExists = await geoSpatialSchema.findOne({userId: req.user});

        if(!isUserExists){
            await geoSpatialSchema.findOneAndUpdate(
                { userId, meetingId },
                {
                    $setOnInsert: {
                        userId,
                        meetingId: meeting._id,
                        position: {x:0, y:0},
                        isActive: true
                    },
                },
                {
                    upsert: true,
                    new: true,
                }
            );
        }

        let participants = await geoSpatialSchema.find({ 
            meetingId, 
            isActive: true 
        }).populate("userId", "name email");

        

        res.status(200).json({
            message: `Fetched meeting details of meetingId: ${meetingId}`,
            success: true,
            meeting,
            participants
        });
    }catch (error) { 
        console.error("Get meeting details error:", error); 
        return res.status(500).json({ 
            message: "Failed to fetch meeting details", 
            success: false, error: error.message 
        }); 
    }

}