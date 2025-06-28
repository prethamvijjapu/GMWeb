const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // For calling Flask API
require("dotenv").config();

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(
    process.env.MONGODB_URL || "mongodb+srv://prethamvvrp:Gayathry6724@cluster0.q2krkkk.mongodb.net/BOOKRECOMWEB",
    { useNewUrlParser: true, useUnifiedTopology: true }
)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// User model
const User = require("./models/User");

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// JWT authentication middleware - protects routes from unauthorized access
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token." });
        req.user = user; // Attach user info to request object
        next();
    });
}

// Home route
app.get("/", (req, res) => {
    res.send("Authentication API running");
});

// =================== AUTHENTICATION ROUTES ===================

// User Registration - Creates new user with empty liked and recommended books arrays
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            likedBooks: [],
            recommendedBooks: []
        });
        await user.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Error creating user" });
    }
});

// User Login - Authenticates user and returns JWT token
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token with user information
        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token, message: `Hi, ${user.name}!` });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});

// Logout API - Simple logout endpoint for client-side token removal
app.post("/logout", (req, res) => {
    // With JWT being stateless, logout is mainly handled client-side
    // This endpoint confirms successful logout action
    res.status(200).json({ message: "Logged out successfully" });
});

// =================== BOOK INTERACTION ROUTES ===================

// Like a book - Adds book ID to user's liked books array (protected route)
app.post("/like", authenticateToken, async (req, res) => {
    try {
        const { bookId } = req.body;
        if (bookId === undefined) {
            return res.status(400).json({ message: "bookId required" });
        }

        // Add bookId to likedBooks array, $addToSet prevents duplicates
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $addToSet: { likedBooks: bookId } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ likedBooks: user.likedBooks });
    } catch (error) {
        console.error("Like error:", error);
        res.status(500).json({ message: "Like failed" });
    }
});

// Unlike a book - Removes book ID from user's liked books array (protected route)
app.post("/unlike", authenticateToken, async (req, res) => {
    try {
        const { bookId } = req.body;
        if (bookId === undefined) {
            return res.status(400).json({ message: "bookId required" });
        }

        // Remove bookId from likedBooks array using $pull
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $pull: { likedBooks: bookId } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ likedBooks: user.likedBooks });
    } catch (error) {
        console.error("Unlike error:", error);
        res.status(500).json({ message: "Unlike failed" });
    }
});

// Get user's liked books (protected route)
app.get("/liked-books", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            likedBooks: user.likedBooks,
            count: user.likedBooks.length
        });
    } catch (error) {
        console.error("Fetch liked books error:", error);
        res.status(500).json({ message: "Fetch failed" });
    }
});

// =================== RECOMMENDATION ROUTES ===================

// Generate and store recommendations (protected route) - MAIN ML INTEGRATION API
app.post("/generate-recommendations", authenticateToken, async (req, res) => {
    try {
        // Step 1: Get the current user's liked books from database
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const likedBooks = user.likedBooks || [];

        // Step 2: If user has no liked books, return empty recommendations
        if (likedBooks.length === 0) {
            // Update user's recommendedBooks to empty array
            await User.findByIdAndUpdate(
                req.user.userId,
                { recommendedBooks: [] },
                { new: true }
            );
            return res.json({
                message: "No liked books found. Please like some books first to get recommendations.",
                recommendedBooks: []
            });
        }

        // Step 3: Call Flask ML model API with user's liked books
        console.log("Calling Flask API with liked books:", likedBooks);
        const flaskResponse = await axios.post("http://localhost:5000/recommend", {
            liked_books: likedBooks
        });

        const recommendedBooks = flaskResponse.data.recommendations || [];

        // Step 4: Update user's recommendedBooks array in database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { recommendedBooks: recommendedBooks },
            { new: true }
        );

        // Step 5: Return success response with recommended books
        res.json({
            message: "Recommendations generated successfully!",
            recommendedBooks: updatedUser.recommendedBooks,
            count: updatedUser.recommendedBooks.length
        });

    } catch (error) {
        console.error("Generate recommendations error:", error);

        // Handle specific Flask API errors
        if (error.response) {
            return res.status(500).json({
                message: "Failed to get recommendations from ML model",
                error: error.response.data
            });
        }

        // Handle network or other errors (Flask server not running, etc.)
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({
                message: "Cannot connect to recommendation service. Please ensure Flask API is running on port 5000."
            });
        }

        res.status(500).json({ message: "Failed to generate recommendations" });
    }
});

// Get stored recommendations for user (protected route)
app.get("/recommended-books", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            recommendedBooks: user.recommendedBooks,
            count: user.recommendedBooks.length
        });
    } catch (error) {
        console.error("Fetch recommended books error:", error);
        res.status(500).json({ message: "Failed to fetch recommended books" });
    }
});

// =================== ADDITIONAL UTILITY ROUTES ===================

// Get user profile information (protected route)
app.get("/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                likedBooksCount: user.likedBooks.length,
                recommendedBooksCount: user.recommendedBooks.length
            }
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

// Health check route for Flask API connection
app.get("/health/flask", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/");
        res.json({
            status: "Flask API is running",
            flaskResponse: response.data
        });
    } catch (error) {
        res.status(500).json({
            status: "Flask API is not accessible",
            error: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API endpoints available:`);
    console.log(`- POST /signup - User registration`);
    console.log(`- POST /login - User authentication`);
    console.log(`- POST /logout - User logout`);
    console.log(`- POST /like - Like a book (protected)`);
    console.log(`- POST /unlike - Unlike a book (protected)`);
    console.log(`- GET /liked-books - Get user's liked books (protected)`);
    console.log(`- POST /generate-recommendations - Generate ML recommendations (protected)`);
    console.log(`- GET /recommended-books - Get user's recommendations (protected)`);
    console.log(`- GET /profile - Get user profile (protected)`);
    console.log(`- GET /health/flask - Check Flask API connection`);
});
