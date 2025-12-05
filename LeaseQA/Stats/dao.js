import User from "../Users/model.js";
import Post from "../Posts/model.js";
import Answer from "../Answers/model.js";
import Folder from "../Folders/model.js";

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

    // Find all admin users
    const adminUsers = await User.find({ role: "admin" }, "_id");
    const adminUserIds = adminUsers.map(user => user._id);
    const adminPosts = await Post.countDocuments({ authorId: { $in: adminUserIds } });

    const folders = await Folder.find();
    const breakdown = await Promise.all(
        folders.map(async (folder) => {
            const count = await Post.countDocuments({
                folders: folder.name
            });
            return {
                label: folder.displayName,
                value: count
            };
        })
    );

    return {
        totalPosts,
        unreadPosts,
        unansweredPosts,
        lawyerResponses,
        tenantResponses,
        enrolledUsers,
        adminPosts,
        breakdown
    };
};