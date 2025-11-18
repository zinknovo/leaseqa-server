import Database from "../Database/index.js";
import { newId } from "../utils/ids.js";

export const findDiscussionsByPostId = (postId) =>
  Database.discussions.filter((discussion) => discussion.postId === postId);

export const findDiscussionById = (id) =>
  Database.discussions.find((discussion) => discussion._id === id);

export const createDiscussion = (payload) => {
  const now = new Date().toISOString();
  const discussion = {
    _id: newId("discussion"),
    postId: payload.postId,
    parentId: payload.parentId || null,
    authorId: payload.authorId,
    content: payload.content,
    isResolved: payload.isResolved || false,
    createdAt: now,
    updatedAt: now,
  };
  Database.discussions = [...Database.discussions, discussion];
  return discussion;
};

export const updateDiscussion = (discussionId, updates) => {
  Database.discussions = Database.discussions.map((discussion) =>
    discussion._id === discussionId
      ? { ...discussion, ...updates, updatedAt: new Date().toISOString() }
      : discussion
  );
  return findDiscussionById(discussionId);
};

export const deleteDiscussion = (discussionId) => {
  const before = Database.discussions.length;
  Database.discussions = Database.discussions.filter(
    (discussion) => discussion._id !== discussionId && discussion.parentId !== discussionId
  );
  return { acknowledged: before !== Database.discussions.length };
};

export const findDiscussionTreeForPost = (postId) => {
  const threads = findDiscussionsByPostId(postId);
  const map = new Map();
  threads.forEach((node) => {
    map.set(node._id, { ...node, replies: [] });
  });
  const roots = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId).replies.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};
