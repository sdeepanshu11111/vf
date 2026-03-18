const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const client = new MongoClient(process.env.MONGODB_URI);

async function seed() {
  try {
    await client.connect();
    const db = client.db();

    console.log("Cleaning database...");
    await db.collection("users").deleteMany({});
    await db.collection("posts").deleteMany({});
    await db.collection("comments").deleteMany({});
    await db.collection("notifications").deleteMany({});
    await db.collection("conversations").deleteMany({});
    await db.collection("messages").deleteMany({});
    await db.collection("invites").deleteMany({});

    console.log("Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [
      {
        _id: new ObjectId(),
        name: "Arjun Mehta",
        email: "arjun@example.com",
        username: "arjun",
        passwordHash: hashedPassword,
        role: "admin",
        tier: "scale",
        points: 2500,
        postCount: 15,
        winCount: 6,
        tipCount: 5,
        questionCount: 2,
        sourcingCount: 2,
        bio: "Scale focused founder. Ran 3 brands to 1Cr+ monthly GMV.",
        city: "Delhi",
        niche: "Health & Wellness",
        gmvRange: "₹50L+",
        joinedAt: new Date(),
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Arjun",
        followers: [],
        following: [],
        isBanned: false,
      },
      {
        _id: new ObjectId(),
        name: "Priya Sharma",
        email: "priya@example.com",
        username: "priya",
        passwordHash: hashedPassword,
        role: "moderator",
        tier: "growth",
        points: 1200,
        postCount: 8,
        winCount: 2,
        tipCount: 4,
        questionCount: 1,
        sourcingCount: 1,
        bio: "Creative strategist turned D2C founder.",
        city: "Mumbai",
        niche: "Fashion",
        gmvRange: "₹10L–50L",
        joinedAt: new Date(),
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Priya",
        followers: [],
        following: [],
        isBanned: false,
      },
      {
        _id: new ObjectId(),
        name: "Rohan Das",
        email: "rohan@example.com",
        username: "rohan",
        passwordHash: hashedPassword,
        role: "member",
        tier: "starter",
        points: 450,
        postCount: 3,
        winCount: 0,
        tipCount: 1,
        questionCount: 2,
        sourcingCount: 0,
        bio: "Just launched my first dropshipping store. Learning everyday.",
        city: "Bangalore",
        niche: "Electronics",
        gmvRange: "Just starting",
        joinedAt: new Date(),
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rohan",
        followers: [],
        following: [],
        isBanned: false,
      },
    ];

    users[0].followers = [users[1]._id.toString(), users[2]._id.toString()];
    users[0].following = [users[1]._id.toString()];
    users[1].followers = [users[0]._id.toString()];
    users[1].following = [users[0]._id.toString(), users[2]._id.toString()];
    users[2].following = [users[0]._id.toString()];

    await db.collection("users").insertMany(users);

    console.log("Seeding posts...");
    const posts = [
      {
        _id: new ObjectId(),
        authorId: users[0]._id.toString(),
        content:
          "Just crossed 1Cr GMV this month! 🚀 The key was optimizing our RTO strategy.",
        type: "win",
        tags: ["milestone", "RTO", "strategy"],
        images: [
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        ],
        upvotes: [users[1]._id.toString()],
        commentCount: 1,
        flagCount: 0,
        flaggedBy: [],
        status: "active",
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        _id: new ObjectId(),
        authorId: users[1]._id.toString(),
        content:
          "Does anyone have good sourcing contacts for high-quality cotton in Ludhiana?",
        type: "question",
        tags: ["sourcing", "apparel"],
        upvotes: [],
        commentCount: 0,
        flagCount: 0,
        flaggedBy: [],
        status: "active",
        createdAt: new Date(Date.now() - 7200000),
      },
    ];

    await db.collection("posts").insertMany(posts);

    console.log("Seeding comments...");
    const comment = {
      _id: new ObjectId(),
      postId: posts[0]._id.toString(),
      authorId: users[1]._id.toString(),
      content: "Congratulations Arjun! Huge milestone.",
      upvotes: [],
      parentId: null,
      createdAt: new Date(),
    };
    await db.collection("comments").insertOne(comment);

    console.log("Seeding conversations...");
    const convo = {
      _id: new ObjectId(),
      participants: [users[0]._id.toString(), users[1]._id.toString()],
      lastMessage: "Thanks for the tips!",
      lastAt: new Date(),
      participantIds: [users[0]._id.toString(), users[1]._id.toString()],
    };
    await db.collection("conversations").insertOne(convo);

    const messages = [
      {
        conversationId: convo._id.toString(),
        senderId: users[0]._id.toString(),
        content: "Hey Priya, loved your strategy on Instagram.",
        readAt: new Date(Date.now() - 50000),
        createdAt: new Date(Date.now() - 100000),
      },
      {
        conversationId: convo._id.toString(),
        senderId: users[1]._id.toString(),
        content: "Thanks Arjun! Getting there.",
        readAt: null,
        createdAt: new Date(),
      },
    ];
    await db.collection("messages").insertMany(messages);

    console.log("Seeding notifications...");
    const notification = {
      userId: users[0]._id.toString(),
      actorId: users[1]._id.toString(),
      type: "upvote",
      postId: posts[0]._id.toString(),
      read: false,
      createdAt: new Date(),
    };
    await db.collection("notifications").insertOne(notification);

    console.log("Success: Database seeded! 🌱");
    console.log("Admin: arjun@example.com / password123");
    console.log("Mod: priya@example.com / password123");
    console.log("User: rohan@example.com / password123");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await client.close();
  }
}

seed();
