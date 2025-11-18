import Database from "../Database/index.js";
import { newId } from "../utils/ids.js";

export const listReviewsForUser = (userId) =>
  Database.aiReviews.filter((review) => review.userId === userId);

export const findReviewById = (id) => Database.aiReviews.find((review) => review._id === id);

export const createReview = (payload) => {
  const review = {
    _id: newId("review"),
    userId: payload.userId,
    contractType: payload.contractType || null,
    contractTextPreview: payload.contractTextPreview?.slice(0, 280) || "",
    aiResponse: payload.aiResponse,
    relatedPostId: payload.relatedPostId || null,
    createdAt: new Date().toISOString(),
  };
  Database.aiReviews = [review, ...Database.aiReviews];
  return review;
};
