require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

// Ensure MongoDB URI is loaded
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined. Check your .env file.");
    process.exit(1); // Stop server if MongoDB URI is missing
}

// MongoDB Connection
mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Video Schema
const videoSchema = new mongoose.Schema({
    title: String,
    videoPath: String
});
const Video = mongoose.model("Video", videoSchema);

// Ensure `uploads` folder exists
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

// Multer Storage & Validation
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype !== "video/mp4") {
        return cb(new Error("Only MP4 videos are allowed"), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload Video API
app.post("/upload", upload.single("video"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Invalid file format or file too large" });
        }

        const video = new Video({ title: req.body.title, videoPath: req.file.filename });
        await video.save();
        res.json({ message: "Video uploaded successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error uploading video" });
    }
});

// Get All Videos API
app.get("/videos", async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: "Error fetching videos" });
    }
});

// Stream Video API
app.get("/stream/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Video not found" });
    }

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
        "Content-Type": "video/mp4",
        "Content-Length": stat.size
    });
    fs.createReadStream(filePath).pipe(res);
});

// Update Video Title API
app.put("/update/:id", async (req, res) => {
    try {
        const { title } = req.body;
        await Video.findByIdAndUpdate(req.params.id, { title });
        res.json({ message: "Video updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating video" });
    }
});

// Delete Video API
app.delete("/delete/:id", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: "Video not found" });

        const filePath = path.join(__dirname, "uploads", video.videoPath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: "Video deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting video" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
