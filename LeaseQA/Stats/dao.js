import User from "../Users/model.js";
import Post from "../Posts/model.js";
import Answer from "../Answers/model.js";

export const overview = async () => {
    const totalPosts = await Post.countDocuments();
    const unreadPosts = await Post.countDocuments({ isResolved: false });

    const postsWithAnswers = await Answer.distinct("postId");
    const unansweredPosts = await Post.countDocuments({
        _id: { $nin: postsWithAnswers }
    });

    const lawyerResponses = await Answer.countDocuments({
        answerType: "lawyer_opinion"
    });
    const tenantResponses = await Answer.countDocuments({
        answerType: "community_answer"
    });

    const enrolledUsers = await User.countDocuments();

    return {
        unreadPosts,
        unansweredPosts,
        totalPosts,
        lawyerResponses,
        tenantResponses,
        enrolledUsers,
    };
};