import model from "./model.js";
import bcrypt from "bcryptjs";

export const findAllUsers = () =>
    model.find();

export const findUserById = (id) =>
    model.findById(id);

export const findUserByEmail = (email) =>
    model.findOne({email});

export const createUser = (payload) =>
    model.create({
        username: payload.username,
        email: payload.email,
        hashedPassword: bcrypt.hashSync(payload.password, 10),
        role: payload.role || "tenant",
        lawyerVerification: payload.lawyerVerification || null,
        banned: false,
    });

export const updateUser = (userId, updates) =>
    model.findByIdAndUpdate(userId, updates, {new: true});

export const deleteUser = (userId) =>
    model.findByIdAndDelete(userId);

export const verifyPassword = (plainPassword, hashedPassword) =>
    bcrypt.compareSync(plainPassword, hashedPassword);

export const verifyLawyer = (userId) =>
    model.findByIdAndUpdate(
        userId,
        {"lawyerVerification.verifiedAt": new Date()},
        {new: true}
    );

export const banUser = (userId) =>
    model.findByIdAndUpdate(userId, {banned: true}, {new: true});

export const unbanUser = (userId) =>
    model.findByIdAndUpdate(userId, {banned: false}, {new: true});

export const sanitizeUser = (user) => {
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : user;
    const {hashedPassword, ...rest} = userObj;
    return rest;
};