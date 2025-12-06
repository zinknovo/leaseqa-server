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

export const ensureUncategorized = async () => {
    const existing = await findFolderByName("uncategorized");
    if (existing) return existing;
    return createFolder({
        name: "uncategorized",
        displayName: "Uncategorized",
        description: "Posts moved here when a section is removed",
        color: "#94a3b8",
    });
};

export const ensureDefaults = async (defaults = []) => {
    const results = [];
    for (const def of defaults) {
        const found = await findFolderByName(def.name);
        if (!found) {
            const created = await createFolder({
                ...def,
                isDefault: true,
            });
            results.push(created);
        }
    }
    return results;
};
