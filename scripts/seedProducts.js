const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");

const client = new MongoClient(process.env.MONGODB_URI);

async function seedProducts() {
  try {
    await client.connect();
    const db = client.db();

    console.log("Reading product data...");
    const dataPath = path.join(__dirname, "../productData.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const products = JSON.parse(rawData);

    // Make sure we add a timestamp or maintain existing data shapes if possible
    console.log(`Found ${products.length} products. Cleaning existing products collection...`);
    await db.collection("products").deleteMany({});

    console.log("Seeding products...");
    // Optionally format or validate data here before insert
    const result = await db.collection("products").insertMany(products);
    
    console.log(`Success: Inserted ${result.insertedCount} products into MongoDB! 🌱`);
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    await client.close();
  }
}

seedProducts();
