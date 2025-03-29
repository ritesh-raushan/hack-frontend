const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Chat Schema
const chatSchema = new mongoose.Schema({
    userMessage: String,
    llmResponse: String,
    timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model("Chat", chatSchema);

// Fetch previous chats
app.get("/chats", async (req, res) => {
    try {
        const chats = await Chat.find().sort({ timestamp: 1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handle chat request
app.post("/chat", async (req, res) => {
    const { message } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Correct model version
        const result = await model.generateContent(message);
        const response = result.response.text(); // Fix: Extract response text properly

        // Save to MongoDB
        const newChat = new Chat({ userMessage: message, llmResponse: response });
        await newChat.save();

        res.json({ response });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
