require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined. Check your .env file.");
    process.exit(1);
}

// MongoDB Connection
const conn = mongoose.createConnection(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

// GridFS Storage
const storage = new GridFsStorage({
    url: MONGO_URI,
    file: (req, file) => {
        return {
            filename: Date.now() + "-" + file.originalname,
            bucketName: "uploads"
        };
    }
});
const upload = multer({ storage });

// Upload Video API (GridFS)
app.post("/upload", upload.single("video"), async (req, res) => {
    try {
        res.json({ message: "Video uploaded successfully", file: req.file });
    } catch (err) {
        res.status(500).json({ message: "Error uploading video" });
    }
});

// Fetch All Videos
app.get("/videos", async (req, res) => {
    try {
        gfs.files.find().toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({ message: "No videos found" });
            }
            res.json(files);
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching videos" });
    }
});

// Stream Video API (GridFS)
app.get("/stream/:filename", async (req, res) => {
    try {
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            if (!file) {
                return res.status(404).json({ message: "Video not found" });
            }
            const readStream = gfs.createReadStream(file.filename);
            res.set("Content-Type", "video/mp4");
            readStream.pipe(res);
        });
    } catch (err) {
        res.status(500).json({ message: "Error streaming video" });
    }
});

// Delete Video API
app.delete("/delete/:filename", async (req, res) => {
    try {
        gfs.remove({ filename: req.params.filename, root: "uploads" }, (err) => {
            if (err) return res.status(500).json({ message: "Error deleting video" });
            res.json({ message: "Video deleted successfully" });
        });
    } catch (err) {
        res.status(500).json({ message: "Error deleting video" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
