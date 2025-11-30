import mongoose, {Types} from "mongoose";

const AnswerSchema = new mongoose.Schema(
    {
        postId: {type: Types.ObjectId, ref: "Post", required: true, index: true},
        authorId: {type: Types.ObjectId, ref: "User", required: true},
        answerType: {
            type: String,
            enum: ["lawyer_opinion", "community_answer"],
            default: "community_answer",
        },
        content: {type: String, required: true},
        isAccepted: {type: Boolean, default: false},
    },
    {
        timestamps: true,
        collection: "answers"
    },
);

export default AnswerSchema;
