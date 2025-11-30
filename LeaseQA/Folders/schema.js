import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, unique: true},
        displayName: {type: String, required: true},
        description: {type: String},
        isDefault: {type: Boolean, default: false},
    },
    {
        timestamps: true,
        collection: "folders"
    },
);

export default FolderSchema;
