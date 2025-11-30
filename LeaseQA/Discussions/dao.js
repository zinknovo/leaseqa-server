import model from "./model.js";

export const findDiscussionsByPostId = (postId) =>
    model.find({postId});

export const findDiscussionById = (id) =>
    model.findById(id);

export const createDiscussion = (payload) =>
    model.create({
        postId: payload.postId,
        parentId: payload.parentId || null,
        authorId: payload.authorId,
        content: payload.content,
        isResolved: payload.isResolved || false,
    });

export const updateDiscussion = (discussionId, updates) =>
    model.findByIdAndUpdate(discussionId, updates, {new: true});

export const deleteDiscussion = (discussionId) =>
    model.findByIdAndDelete(discussionId);

export const deleteDiscussionsByPostId = (postId) =>
    model.deleteMany({postId});

export const deleteReplies = (parentId) =>
    model.deleteMany({parentId});

export const findDiscussionTreeForPost = async (postId) => {
    const threads = await model.find({postId});

    const map = new Map();
    threads.forEach((node) => {
        map.set(node._id.toString(), {...node.toObject(), replies: []});
    });

    const roots = [];
    map.forEach((node) => {
        if (node.parentId && map.has(node.parentId.toString())) {
            map.get(node.parentId.toString()).replies.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
};