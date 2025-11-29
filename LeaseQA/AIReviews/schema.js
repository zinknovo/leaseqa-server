import mongoose, {Types} from "mongoose";

const aiReviewSchema = new mongoose.Schema(
    {
        userId: {type: Types.ObjectId, ref: "User", required: false, index: true},
        contractType: {type: String},
        contractText: {type: String, required: true},
        contractFileUrl: {type: String},
        aiResponse: {
            summary: {type: String, required: true},
            highRisk: {type: [String], default: []},
            mediumRisk: {type: [String], default: []},
            lowRisk: {type: [String], default: []},
            recommendations: {type: [String], default: []},
        },
        relatedPostId: {type: Types.ObjectId, ref: "Post"},
    },
    {
        timestamps: true,
        collection: "aiReviews"
    }
);

export default aiReviewSchema;