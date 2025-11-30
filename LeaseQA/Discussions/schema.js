import mongoose, {Types} from "mongoose";

const DiscussionSchema = new mongoose.Schema(
    {
        postId: {type: Types.ObjectId, ref: "Post", required: true, index: true},
        parentId: {type: Types.ObjectId, ref: "Discussion", default: null},
        authorId: {type: Types.ObjectId, ref: "User", required: true},
        content: {type: String, required: true},
        isResolved: {type: Boolean, default: false},
    },
    {
        timestamps: true,
        collection: "discussions"
    },
);

DiscussionSchema.index({postId: 1, parentId: 1});

export default DiscussionSchema;
