const Farmer = require("../models/Farmer");
const crypto = require("crypto");

const hashPassword = (password) => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

exports.register = async (req, res) => {
    try {
        const { fullName, phoneNumber, password, region, woreda, preferredLanguage, role } = req.body;

        const existing = await Farmer.findOne({ phoneNumber });
        if (existing) {
            return res.status(400).json({ error: "Phone number already registered" });
        }

        const hashedPassword = hashPassword(password);

        const farmer = await Farmer.create({
            fullName,
            phoneNumber,
            password: hashedPassword,
            region,
            woreda,
            preferredLanguage: preferredLanguage || "am",
            role: role || "farmer"
        });

        res.status(201).json({ message: "User registered successfully", userId: farmer._id, role: farmer.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        const user = await Farmer.findOne({ phoneNumber });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // In a real app, sign a JWT here. 
        // For this prototype, we'll just return success and the user info.
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
};
