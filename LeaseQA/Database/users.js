import bcrypt from "bcryptjs";

const hash = (raw) => bcrypt.hashSync(raw, 10);

const now = new Date().toISOString();

const users = [
  {
    _id: "user-tenant-1",
    username: "Casey Tenant",
    email: "casey@leaseqa.dev",
    password: hash("casey123"),
    role: "tenant",
    profile: {
      location: "Boston, MA",
      preferredLanguage: "en",
    },
    createdAt: now,
    updatedAt: now,
    banned: false,
  },
  {
    _id: "user-lawyer-1",
    username: "Lena Lawyer",
    email: "lena@leaseqa.dev",
    password: hash("lena123"),
    role: "lawyer",
    lawyerVerification: {
      barNumber: "MA-998877",
      state: "MA",
      verifiedAt: "2024-04-02T10:00:00.000Z",
    },
    profile: {
      location: "Cambridge, MA",
      firm: "Lease Legal Partners",
    },
    createdAt: now,
    updatedAt: now,
    banned: false,
  },
  {
    _id: "user-admin-1",
    username: "Ari Admin",
    email: "ari@leaseqa.dev",
    password: hash("ari123"),
    role: "admin",
    profile: {
      location: "Somerville, MA",
    },
    createdAt: now,
    updatedAt: now,
    banned: false,
  },
];

export default users;
