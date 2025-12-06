import mongoose from "mongoose";

const LawyerVerificationSchema = new mongoose.Schema(
    {
        barNumber: {type: String, required: true},
        state: {type: String, required: true},
        verifiedAt: {type: Date},
    },
    {_id: false},
);

const UserSchema = new mongoose.Schema(
    {
        username: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        hashedPassword: {type: String, required: true},
        role: {
            type: String,
            enum: ["tenant", "lawyer", "admin"],
            default: "tenant",
            required: true,
        },
        lawyerVerification: LawyerVerificationSchema,
    },
    {
        timestamps: true,
        collection: "users"
    },
);

export default UserSchema;

