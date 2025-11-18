import Database from "../Database/index.js";
import { newId } from "../utils/ids.js";

export const listFolders = () => Database.folders;

export const createFolder = (payload) => {
  const folder = {
    _id: newId("folder"),
    name: payload.name,
    displayName: payload.displayName,
    description: payload.description || "",
    color: payload.color || "#475569",
  };
  Database.folders = [...Database.folders, folder];
  return folder;
};

export const updateFolder = (folderId, updates) => {
  Database.folders = Database.folders.map((folder) =>
    folder._id === folderId ? { ...folder, ...updates } : folder
  );
  return Database.folders.find((folder) => folder._id === folderId);
};

export const deleteFolder = (folderId) => {
  const before = Database.folders.length;
  Database.folders = Database.folders.filter((folder) => folder._id !== folderId);
  return { acknowledged: before !== Database.folders.length };
};
