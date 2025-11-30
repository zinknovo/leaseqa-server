import model from "./model.js";

export const listFolders = () =>
    model.find();

export const findFolderById = (id) =>
    model.findById(id);

export const findFolderByName = (name) =>
    model.findOne({ name });

export const createFolder = (payload) =>
    model.create({
        name: payload.name,
        displayName: payload.displayName,
        description: payload.description || "",
        color: payload.color || "#475569",
    });

export const updateFolder = (folderId, updates) =>
    model.findByIdAndUpdate(folderId, updates, { new: true });

export const deleteFolder = (folderId) =>
    model.findByIdAndDelete(folderId);