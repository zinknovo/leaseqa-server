import model from "./model.js";

export const listPosts = (filters = {}) => {
    const {folder, search, role, viewerRole} = filters;

    const query = {};

    if (folder) {
        query.folders = folder;
    }

    if (search) {
        query.$or = [
            {summary: {$regex: search, $options: "i"}},
            {details: {$regex: search, $options: "i"}}
        ];
    }

    if (role === "lawyer" && viewerRole !== "lawyer") {
        query.lawyerOnly = {$ne: true};
    }

    return model.find(query).sort({lastActivityAt: -1});
};

export const findPostById = (id) =>
    model.findById(id);

export const findPostsByAuthor = (authorId) =>
    model.find({authorId});

export const findPostsByFolder = (folder) =>
    model.find({folders: folder});

export const createPost = (payload) =>
    model.create({
        summary: payload.summary,
        details: payload.details,
        postType: payload.postType || "question",
        visibility: payload.visibility || "class",
        folders: payload.folders,
        authorId: payload.authorId,
        lawyerOnly: payload.lawyerOnly || false,
        fromAIReviewId: payload.fromAIReviewId || null,
        urgency: payload.urgency || "low",
        viewCount: 0,
        isResolved: false,
        lastActivityAt: new Date(),
    });

export const updatePost = (postId, updates) =>
    model.findByIdAndUpdate(postId, updates, {new: true});

export const incrementViewCount = (postId) =>
    model.findByIdAndUpdate(postId, {$inc: {viewCount: 1}}, {new: true});

export const updateLastActivity = (postId) =>
    model.findByIdAndUpdate(postId, {lastActivityAt: new Date()}, {new: true});

export const deletePost = (postId) =>
    model.findByIdAndDelete(postId);