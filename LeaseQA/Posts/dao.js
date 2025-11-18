import Database from "../Database/index.js";
import { newId } from "../utils/ids.js";

export const listPosts = (filters = {}) => {
  const { folder, search, role } = filters;
  return Database.posts.filter((post) => {
    if (folder && !post.folders.includes(folder)) {
      return false;
    }
    if (search) {
      const query = search.toLowerCase();
      if (
        !post.summary.toLowerCase().includes(query) &&
        !post.details.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (role === "lawyer" && post.lawyerOnly && filters.viewerRole !== "lawyer") {
      return false;
    }
    return true;
  });
};

export const findPostById = (id) => Database.posts.find((post) => post._id === id);

export const createPost = (payload) => {
  const now = new Date().toISOString();
  const newPost = {
    _id: newId("post"),
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
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  };
  Database.posts = [newPost, ...Database.posts];
  return newPost;
};

export const updatePost = (postId, updates) => {
  Database.posts = Database.posts.map((post) =>
    post._id === postId
      ? { ...post, ...updates, updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() }
      : post
  );
  return findPostById(postId);
};

export const removePost = (postId) => {
  const before = Database.posts.length;
  Database.posts = Database.posts.filter((post) => post._id !== postId);
  return { acknowledged: before !== Database.posts.length };
};
