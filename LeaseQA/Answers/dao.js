import model from "./model.js";

export const findAnswersByPostId = (postId) =>
    model.find({postId});

export const findAnswerById = (id) =>
    model.findById(id);

export const createAnswer = (payload) =>
    model.create({
        postId: payload.postId,
        authorId: payload.authorId,
        answerType: payload.answerType,
        content: payload.content,
        isAccepted: false,
    });

export const updateAnswer = (answerId, updates) =>
    model.findByIdAndUpdate(answerId, updates, {new: true});

export const acceptAnswer = (answerId) =>
    model.findByIdAndUpdate(answerId, {isAccepted: true}, {new: true});

export const deleteAnswer = (answerId) =>
    model.findByIdAndDelete(answerId);

export const deleteAnswersByPostId = (postId) =>
    model.deleteMany({postId});