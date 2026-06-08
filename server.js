const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../public")));

const DB_FILE = path.join(__dirname, "db.json");

function loadDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// 📌 TikTok-style ranking (simple version)
function rankFeed(posts) {
  return posts.sort((a, b) => {
    const scoreA = (a.likes * 2) + (a.comments.length * 3);
    const scoreB = (b.likes * 2) + (b.comments.length * 3);
    return scoreB - scoreA;
  });
}

// 📌 Pagination (IMPORTANT for infinite scroll)
app.get("/feed", (req, res) => {
  const db = loadDB();

  let posts = rankFeed(db.posts);

  const page = parseInt(req.query.page || "1");
  const limit = 5;

  const start = (page - 1) * limit;
  const end = start + limit;

  res.json({
    posts: posts.slice(start, end),
    hasMore: end < posts.length
  });
});

// upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  const db = loadDB();

  const post = {
    id: Date.now(),
    videoUrl: `/uploads/${req.file.filename}`,
    likes: 0,
    comments: []
  };

  db.posts.unshift(post);
  saveDB(db);

  res.json(post);
});

app.post("/like/:id", (req, res) => {
  const db = loadDB();
  const post = db.posts.find(p => p.id == req.params.id);
  if (post) post.likes++;
  saveDB(db);
  res.json(post);
});

app.post("/comment/:id", (req, res) => {
  const db = loadDB();
  const post = db.posts.find(p => p.id == req.params.id);
  if (post) post.comments.push(req.body.comment);
  saveDB(db);
  res.json(post);
});

app.listen(PORT, () => console.log("http://localhost:" + PORT));