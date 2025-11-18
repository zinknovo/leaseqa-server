import Database from "../Database/index.js";

export const overview = () => {
  const unanswered = Database.posts.filter(
    (post) => !Database.answers.some((answer) => answer.postId === post._id)
  ).length;
  const lawyerResponses = Database.answers.filter(
    (answer) => answer.answerType === "lawyer_opinion"
  ).length;
  const tenantResponses = Database.answers.filter(
    (answer) => answer.answerType === "community_answer"
  ).length;

  return {
    unreadPosts: Database.posts.filter((post) => !post.isResolved).length,
    unansweredPosts: unanswered,
    totalPosts: Database.posts.length,
    lawyerResponses,
    tenantResponses,
    enrolledUsers: Database.users.length,
  };
};
