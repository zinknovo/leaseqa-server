import Database from "../Database/index.js";
import bcrypt from "bcryptjs";
import { newId } from "../utils/ids.js";

export const findAllUsers = () => Database.users;

export const findUserById = (id) => Database.users.find((user) => user._id === id);

export const findUserByEmail = (email) =>
  Database.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const createUser = (payload) => {
  const now = new Date().toISOString();
  const newUser = {
    _id: newId("user"),
    username: payload.username,
    email: payload.email,
    password: bcrypt.hashSync(payload.password, 10),
    role: payload.role || "tenant",
    lawyerVerification: payload.lawyerVerification || null,
    profile: payload.profile || {},
    createdAt: now,
    updatedAt: now,
    banned: false,
  };
  Database.users = [...Database.users, newUser];
  return newUser;
};

export const updateUser = (userId, updates) => {
  Database.users = Database.users.map((user) =>
    user._id === userId ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
  );
  return findUserById(userId);
};

export const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }
  const { password, ...rest } = user;
  return rest;
};
