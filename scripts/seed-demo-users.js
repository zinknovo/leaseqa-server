import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UsersModel from "../LeaseQA/Users/model.js";

const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (!DEMO_PASSWORD) {
    console.error("DEMO_PASSWORD is required in .env");
    process.exit(1);
}
const usersToSeed = [
    {
        email: "admin@leaseqa.dev",
        username: "Demo Admin",
        role: "admin",
    },
    {
        email: "tenant@leaseqa.dev",
        username: "Demo Tenant",
        role: "tenant",
    },
];

async function main() {
    const mongoUrl = process.env.DATABASE_CONNECTION_STRING;
    if (!mongoUrl) {
        console.error("DATABASE_CONNECTION_STRING is required");
        process.exit(1);
    }

    await mongoose.connect(mongoUrl);
    const hashed = bcrypt.hashSync(DEMO_PASSWORD, 10);

    for (const user of usersToSeed) {
        await UsersModel.findOneAndUpdate(
            { email: user.email },
            {
                username: user.username,
                email: user.email,
                role: user.role,
                hashedPassword: hashed,
                banned: false,
            },
            { upsert: true, new: true }
        );
        console.log(`Seeded ${user.email} (${user.role}) with password ${DEMO_PASSWORD}`);
    }

    await mongoose.disconnect();
}

main()
    .then(() => {
        console.log("Done seeding demo users.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Failed to seed demo users", err);
        process.exit(1);
    });
