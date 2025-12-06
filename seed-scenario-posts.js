import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Users from "./LeaseQA/Users/model.js";
import Posts from "./LeaseQA/Posts/model.js";
import Answers from "./LeaseQA/Answers/model.js";
import Discussions from "./LeaseQA/Discussions/model.js";

const scenarios = [
    {
        summary: "Landlord refusing to return security deposit",
        details: "Gave a 60-day notice, apartment left clean. Landlord claims 'extra cleaning' without receipts. How to demand full deposit back in MA?",
        folders: ["deposit"],
        offsetDays: 1, // this week
        urgency: "high",
    },
    {
        summary: "Deposit deductions for painting and small nail holes",
        details: "Moved out after 18 months. Landlord charged repainting and patching nail holes. Is this normal wear and tear?",
        folders: ["deposit"],
        offsetDays: 3, // this week
        urgency: "medium",
    },
    {
        summary: "Received 14-day notice for nonpayment, options?",
        details: "Two weeks behind due to job loss. Got a 14-day notice to quit. Can I cure by paying or set up a payment plan to avoid eviction?",
        folders: ["eviction"],
        offsetDays: 8, // last week
        urgency: "high",
    },
    {
        summary: "No heat for 3 days in winter",
        details: "Boston apartment heat went out, landlord slow to respond. What are my rights and can I withhold rent until fixed?",
        folders: ["utilities", "repairs"],
        offsetDays: 12, // last week
        urgency: "high",
    },
    {
        summary: "Mold in bathroom, landlord only paints over",
        details: "Persistent mold despite cleaning, landlord just paints. Is this a habitability issue and how to document/force repairs?",
        folders: ["repairs"],
        offsetDays: 18, // this month
    },
    {
        summary: "Breaking lease due to job relocation",
        details: "Need to move for work with 4 months left on lease. Can I assign or sublet to avoid penalty? What notice is required?",
        folders: ["leasebreak", "sublease"],
        offsetDays: 26, // this month
    },
    {
        summary: "Roommate added without consent",
        details: "Original lease for two people, third roommate moved in without landlord approval. Could this breach lease and affect my liability?",
        folders: ["sublease"],
        offsetDays: 40, // earlier
    },
    {
        summary: "Landlord threatened lockout over late fee dispute",
        details: "Paid rent late once, charged high late fee. When I questioned it, landlord mentioned changing locks. Is that legal?",
        folders: ["fees", "harassment"],
        offsetDays: 60, // earlier
    },
    {
        summary: "Electric bill suddenly spiked after landlord work",
        details: "After landlord's contractor worked in building, my unit's electric bill doubled. Possible shared meter issue?",
        folders: ["utilities"],
        offsetDays: 90, // earlier
    },
    {
        summary: "Retaliation after reporting code violation",
        details: "Reported broken fire escape; now landlord refusing to renew lease and reducing services. Is this retaliation?",
        folders: ["harassment", "eviction"],
        offsetDays: 120, // earlier
    },
];

async function getAuthor() {
    const sampleUsers = [
        {username: "seed.admin", email: "seed.admin@example.com", role: "admin"},
        {username: "seed.admin2", email: "seed.admin2@example.com", role: "admin"},
        {username: "seed.lawyer", email: "seed.lawyer@example.com", role: "lawyer"},
        {username: "seed.lawyer2", email: "seed.lawyer2@example.com", role: "lawyer"},
        {username: "seed.tenant", email: "seed.tenant@example.com", role: "tenant"},
        {username: "seed.tenant2", email: "seed.tenant2@example.com", role: "tenant"},
    ];
    const hashedPassword = bcrypt.hashSync("temporaryPass123!", 10);

    for (const def of sampleUsers) {
        const found = await Users.findOne({email: def.email});
        if (!found) {
            await Users.create({...def, hashedPassword, banned: false});
        }
    }
    return Users.find({}).limit(20);
}

async function main() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.DATABASE_CONNECTION_STRING);
        console.log(`Connected to "${mongoose.connection.name}"`);

        const author = await getAuthor();
        console.log(`Using author: ${author.email} (${author._id})`);

        const authors = await getAuthor();
        console.log(`Using authors: ${authors.map(a => `${a.username} (${a.email}) [${a.role}]`).join(", ")}`);

        for (const [idx, s] of scenarios.entries()) {
            const baseDate = new Date();
            baseDate.setDate(baseDate.getDate() - (s.offsetDays || 0));

            // Remove existing to allow fresh createdAt dates
            await Posts.deleteMany({summary: s.summary});

            const postAuthor = authors[idx % authors.length];
            const post = new Posts({
                summary: s.summary,
                details: s.details,
                folders: s.folders,
                authorId: postAuthor._id,
                postType: "question",
                visibility: "class",
                audience: "everyone",
                urgency: s.urgency || "low",
                viewCount: 0,
                isResolved: false,
                lastActivityAt: baseDate,
                createdAt: baseDate,
                updatedAt: baseDate,
            });

            const saved = await post.save({timestamps: false});

            // Seed sample answers
            await Answers.deleteMany({postId: saved._id});
            const answerAuthor = authors[(idx + 1) % authors.length];
            const answerAuthor2 = authors[(idx + 2) % authors.length];
            const answerSamples = [
                {
                    postId: saved._id,
                    authorId: answerAuthor._id,
                    answerType: "lawyer_opinion",
                    content: `<p>Sample answer for “${s.summary}”. In MA, landlords typically cannot charge more than one month security deposit; excess amounts can be disputed.</p>`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    postId: saved._id,
                    authorId: answerAuthor2._id,
                    answerType: "community_answer",
                    content: `<p>Tenant perspective: cite state statutes in writing and consider contacting local housing authority if the landlord doesn’t comply.</p>`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            await Answers.insertMany(answerSamples);

            // Seed sample discussions (root + reply)
            await Discussions.deleteMany({postId: saved._id});
            const discussAuthor = authors[(idx + 3) % authors.length];
            const discussReplyAuthor = authors[(idx + 4) % authors.length];
            const root = await Discussions.create({
                postId: saved._id,
                authorId: discussAuthor._id,
                content: `Follow-up: Did the landlord provide an itemized list with receipts? If not, that’s a compliance gap.`,
                isResolved: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await Discussions.create({
                postId: saved._id,
                parentId: root._id,
                authorId: discussReplyAuthor._id,
                content: `Tip: save photos and receipts. You can escalate to the state AG office if the landlord ignores written demands.`,
                isResolved: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(`Inserted: ${s.summary} (created ${baseDate.toISOString().slice(0,10)})`);
        }
    } catch (err) {
        console.error("Error seeding posts:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

main();
