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
        password: hashedPassword,
        role: "admin",
        tier: "scale",
        points: 2500,
        postCount: 15,
        followerCount: 120,
        followingCount: 45,
        bio: "Scale focused founder. Ran 3 brands to 1Cr+ monthly GMV.",
        city: "Delhi",
        niche: "Health & Wellness",
        gmvRange: "₹50L+",
        joinedAt: new Date(),
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Arjun",
        followers: [],
        following: [],
      },
      {
        _id: new ObjectId(),
        name: "Priya Sharma",
        email: "priya@example.com",
        password: hashedPassword,
        role: "mod",
        tier: "growth",
        points: 1200,
        postCount: 8,
        followerCount: 85,
        followingCount: 60,
        bio: "Creative strategist turned D2C founder.",
        city: "Mumbai",
        niche: "Fashion",
        gmvRange: "₹10L–50L",
        joinedAt: new Date(),
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Priya",
        followers: [],
        following: [],
      },
      {
        _id: new ObjectId(),
        name: "Rohan Das",
        email: "rohan@example.com",
        password: hashedPassword,
        role: "user",
        tier: "starter",
        points: 450,
        postCount: 3,
        followerCount: 12,
        followingCount: 95,
        bio: "Just launched my first dropshipping store. Learning everyday.",
        city: "Bangalore",
        niche: "Electronics",
        gmvRange: "Just starting",
        joinedAt: new Date(),
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rohan",
        followers: [],
        following: [],
      },
    ];

    await db.collection("users").insertMany(users);

    console.log("Seeding posts...");
    const posts = [
      {
        _id: new ObjectId(),
        authorId: users[0]._id,
        content:
          "Just crossed 1Cr GMV this month! 🚀 The key was optimizing our RTO strategy.",
        type: "win",
        tags: ["milestone", "RTO", "strategy"],
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        upvotes: [users[1]._id.toString()],
        commentCount: 1,
        upvoteCount: 1,
        flagCount: 0,
        status: "active",
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        _id: new ObjectId(),
        authorId: users[1]._id,
        content:
          "Does anyone have good sourcing contacts for high-quality cotton in Ludhiana?",
        type: "question",
        tags: ["sourcing", "apparel"],
        upvotes: [],
        commentCount: 0,
        upvoteCount: 0,
        flagCount: 0,
        status: "active",
        createdAt: new Date(Date.now() - 7200000),
      },
    ];

    await db.collection("posts").insertMany(posts);

    console.log("Seeding comments...");
    const comment = {
      _id: new ObjectId(),
      postId: posts[0]._id,
      authorId: users[1]._id,
      content: "Congratulations Arjun! Huge milestone.",
      upvotes: [],
      createdAt: new Date(),
    };
    await db.collection("comments").insertOne(comment);

    console.log("Seeding conversations...");
    const convo = {
      _id: new ObjectId(),
      participants: [users[0]._id, users[1]._id],
      lastMessage: "Thanks for the tips!",
      lastAt: new Date(),
      participantIds: [users[0]._id.toString(), users[1]._id.toString()],
    };
    await db.collection("conversations").insertOne(convo);

    const messages = [
      {
        conversationId: convo._id,
        senderId: users[0]._id,
        content: "Hey Priya, loved your strategy on Instagram.",
        read: true,
        createdAt: new Date(Date.now() - 100000),
      },
      {
        conversationId: convo._id,
        senderId: users[1]._id,
        content: "Thanks Arjun! Getting there.",
        read: false,
        createdAt: new Date(),
      },
    ];
    await db.collection("messages").insertMany(messages);

    console.log("Seeding notifications...");
    const notification = {
      userId: users[0]._id,
      actorId: users[1]._id,
      type: "upvote",
      postId: posts[0]._id,
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
