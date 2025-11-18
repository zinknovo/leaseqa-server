import Database from "../Database/index.js";
import { newId } from "../utils/ids.js";

export const findAnswersByPostId = (postId) =>
  Database.answers.filter((answer) => answer.postId === postId);

export const findAnswerById = (id) => Database.answers.find((answer) => answer._id === id);

export const createAnswer = (payload) => {
  const now = new Date().toISOString();
  const answer = {
    _id: newId("answer"),
    postId: payload.postId,
    authorId: payload.authorId,
    answerType: payload.answerType,
    content: payload.content,
    createdAt: now,
    updatedAt: now,
    isAccepted: false,
  };
  Database.answers = [answer, ...Database.answers];
  return answer;
};

export const updateAnswer = (answerId, updates) => {
  Database.answers = Database.answers.map((answer) =>
    answer._id === answerId ? { ...answer, ...updates, updatedAt: new Date().toISOString() } : answer
  );
  return findAnswerById(answerId);
};

export const deleteAnswer = (answerId) => {
  const before = Database.answers.length;
  Database.answers = Database.answers.filter((answer) => answer._id !== answerId);
  return { acknowledged: before !== Database.answers.length };
};
