const aiReviews = [
  {
    _id: "review-rent-clause",
    userId: "user-tenant-1",
    contractType: "12-month apartment lease",
    contractTextPreview:
      "Landlord reserves the right to adjust rent to reflect fair market value on sixty (60) days' notice.",
    aiResponse: {
      summary:
        "Clause allows mid-term rent increase without tenant consent. It conflicts with fixed-term protections.",
      highRisk: [
        "Landlord can raise rent after 60 days even if lease has months remaining.",
        "No explicit cap on the adjustment or reference to CPI/state guidelines.",
      ],
      mediumRisk: [
        "No carve-out for hardship or relocation costs if tenant declines new rate.",
      ],
      lowRisk: [
        "Notice period is defined but lacks delivery method requirements.",
      ],
      recommendations: [
        "Request addendum limiting increases to renewal period only.",
        "Add requirement for certified mail notice and mutually signed agreement.",
        "Document the landlord promise in writing before moving in.",
      ],
    },
    createdAt: "2024-09-30T17:12:00.000Z",
    relatedPostId: "post-rent-visibility",
  },
];

export default aiReviews;
