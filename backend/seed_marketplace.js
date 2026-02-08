require("dotenv").config();
const mongoose = require("mongoose");
const Farmer = require("./src/models/Farmer");
const CropListing = require("./src/models/CropListing");

const crops = [
    {
        cropType: "Premium Teff",
        quantity: 50,
        unit: "quintal",
        expectedPrice: 28500,
        location: "Debre Birhan",
        harvestDate: "January 2026",
        verification: {
            status: "verified",
            score: 95,
            reasons: ["Grade A purity", "Low moisture content", "Certified organic"]
        },
        source: "web"
    },
    {
        cropType: "Red Maize",
        quantity: 120,
        unit: "kg",
        expectedPrice: 4200,
        location: "Jimma",
        harvestDate: "December 2025",
        verification: {
            status: "unverified",
            score: 0,
            reasons: []
        },
        source: "ivr"
    },
    {
        cropType: "Arabica Coffee Beans",
        quantity: 10,
        unit: "quintal",
        expectedPrice: 150000,
        location: "Yirgacheffe",
        harvestDate: "February 2026",
        verification: {
            status: "verified",
            score: 98,
            reasons: ["Excellent aroma profile", "Standard bean size", "Verified origin"]
        },
        source: "web"
    },
    {
        cropType: "Large Onions",
        quantity: 500,
        unit: "kg",
        expectedPrice: 8500,
        location: "Bishoftu",
        harvestDate: "January 2026",
        verification: {
            status: "pending",
            score: 0,
            reasons: []
        },
        source: "web"
    },
    {
        cropType: "Wheat (Grade 1)",
        quantity: 80,
        unit: "quintal",
        expectedPrice: 22000,
        location: "Arsi",
        harvestDate: "December 2025",
        verification: {
            status: "verified",
            score: 92,
            reasons: ["High protein content", "Uniform kernel size"]
        },
        source: "web"
    },
    {
        cropType: "Green Chilies",
        quantity: 200,
        unit: "kg",
        expectedPrice: 1200,
        location: "Maki",
        harvestDate: "February 2026",
        verification: {
            status: "unverified",
            score: 0,
            reasons: []
        },
        source: "ivr"
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data (optional, but makes it look fresh)
        await CropListing.deleteMany({});
        await Farmer.deleteMany({});
        console.log("Cleared old listings and farmers.");

        // Create a few farmers
        const farmer1 = await Farmer.create({
            fullName: "Abebe Bekele",
            phoneNumber: "+251911223344",
            region: "Oromia",
            woreda: "Ada'a",
            preferredLanguage: "amharic",
            password: "password123", // In a real app, hash this
            role: "farmer"
        });

        const farmer2 = await Farmer.create({
            fullName: "Mulugeta Tesfaye",
            phoneNumber: "+251922334455",
            region: "Amhara",
            woreda: "Debre Birhan",
            preferredLanguage: "amharic",
            password: "password123",
            role: "farmer"
        });

        const farmer3 = await Farmer.create({
            fullName: "Selamawit Haile",
            phoneNumber: "+251933445566",
            region: "SNNPR",
            woreda: "Yirgacheffe",
            preferredLanguage: "amharic",
            password: "password123",
            role: "farmer"
        });

        // Create listings
        const farmerMap = [farmer1, farmer2, farmer3];

        for (let i = 0; i < crops.length; i++) {
            const farmer = farmerMap[i % farmerMap.length];
            await CropListing.create({
                ...crops[i],
                farmer: farmer._id,
                phoneNumber: farmer.phoneNumber
            });
        }

        console.log(`Successfully seeded ${crops.length} crop listings.`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();
