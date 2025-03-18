require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");

const app = express();

// ✅ CORS configuration (Allow only your frontend)
app.use(cors({
    origin: "https://video-streaming-pumw.vercel.app/", // किंवा specific frontend URL ठेव
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


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

// ✅ GridFS Storage (Fixing misplaced storage definition)
const storage = new GridFsStorage({
    url: MONGO_URI,
    file: (req, file) => {
        return {
            filename: Date.now() + "-" + file.originalname,
            bucketName: "uploads"
        };
    }
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

// ✅ Upload Video API (GridFS)
app.post("/api/upload", upload.single("video"), async (req, res) => {
    try {
        res.json({ message: "Video uploaded successfully", file: req.file });
    } catch (err) {
        res.status(500).json({ message: "Error uploading video", error: err.message });
    }
});

// ✅ Fetch All Videos
app.get("/api/videos", async (req, res) => {
    try {
        gfs.files.find().toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({ message: "No videos found" });
            }
            res.json(files);
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching videos", error: err.message });
    }
});

// ✅ Stream Video API (GridFS)
app.get("/api/stream/:filename", async (req, res) => {
    try {
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
            if (!file) {
                return res.status(404).json({ message: "Video not found" });
            }

            const range = req.headers.range;
            if (!range) {
                return res.status(400).send("Requires Range header");
            }

            const videoSize = file.length;
            const CHUNK_SIZE = 10 ** 6; // 1MB chunk size
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

            const contentLength = end - start + 1;
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4",
            };

            res.writeHead(206, headers);
            const readStream = gfs.createReadStream({ filename: file.filename, start, end });
            readStream.pipe(res);
        });
    } catch (err) {
        res.status(500).json({ message: "Error streaming video", error: err.message });
    }
});

// ✅ Delete Video API
app.delete("/api/delete/:filename", async (req, res) => {
    try {
        gfs.remove({ filename: req.params.filename, root: "uploads" }, (err) => {
            if (err) return res.status(500).json({ message: "Error deleting video", error: err.message });
            res.json({ message: "Video deleted successfully" });
        });
    } catch (err) {
        res.status(500).json({ message: "Error deleting video", error: err.message });
    }
});


app.get("/", (req, res) => {
    res.send("Backend is working!");
});


// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
