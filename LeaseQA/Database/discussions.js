const discussions = [
  {
    _id: "discussion-rent-followup",
    postId: "post-rent-visibility",
    parentId: null,
    authorId: "user-tenant-1",
    content:
      "If the landlord refuses to sign the addendum do I have grounds to terminate early without penalty?",
    isResolved: false,
    createdAt: "2024-10-04T13:22:00.000Z",
    updatedAt: "2024-10-04T13:22:00.000Z",
  },
  {
    _id: "discussion-rent-lawyer-reply",
    postId: "post-rent-visibility",
    parentId: "discussion-rent-followup",
    authorId: "user-lawyer-1",
    content:
      "Document the refusal and propose mutual termination with a pro-rated refund. Massachusetts law supports liquidated damages only if outlined in the lease.",
    isResolved: false,
    createdAt: "2024-10-04T15:40:00.000Z",
    updatedAt: "2024-10-04T15:40:00.000Z",
  },
];

export default discussions;
