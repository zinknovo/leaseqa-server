import model from "./model.js";

export const listReviewsForUser = (userId) =>
    model.find({userId});

export const findReviewById = (id) =>
    model.findById(id);

export const createReview = (payload) => {
    const review = {
        userId: payload.userId,
        contractType: payload.contractType || null,
        contractText: payload.contractText,
        contractFileUrl: payload.contractFileUrl || null,
        aiResponse: payload.aiResponse,
        relatedPostId: payload.relatedPostId || null,
    };
    return model.create(review);
};

export const updateReview = (id, data) =>
    model.findByIdAndUpdate(id, data, {new: true});

export const deleteReview = (id) =>
    model.findByIdAndDelete(id);