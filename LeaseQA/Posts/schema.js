import mongoose, {Types} from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        authorId: {type: Types.ObjectId, ref: "User", required: true},
        postType: {
            type: String,
            enum: ["question", "note", "announcement"],
            default: "question",
        },
        visibility: {
            type: String,
            enum: ["class", "private"],
            default: "class",
        },
        audience: {
            type: String,
            enum: ["everyone", "admin"],
            default: "everyone",
            index: true,
        },
        attachments: [
            {
                filename: String,
                url: String,
                mimetype: String,
                size: Number,
                uploadedAt: {type: Date, default: Date.now},
            },
        ],
        folders: {type: [String], default: [], index: true},
        summary: {type: String, required: true, maxlength: 120},
        details: {type: String, required: true},
        urgency: {type: String, enum: ["low", "medium", "high"], default: "low"},
        fromAIReviewId: {type: Types.ObjectId, ref: "AIReview"},
        viewCount: {type: Number, default: 0},
        isPinned: {type: Boolean, default: false},
        isResolved: {type: Boolean, default: false},
        isAnonymous: {type: Boolean, default: false},
        lawyerOnly: {type: Boolean, default: false},
        lastActivityAt: {type: Date, default: Date.now},
    },
    {
        timestamps: true,
        collection: "posts"
    },
);

export default PostSchema;
