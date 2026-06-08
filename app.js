import { initSwipe } from "./swipe.js";

let page = 1;
let loading = false;

async function loadFeed() {
  if (loading) return;
  loading = true;

  const res = await fetch(`/feed?page=${page}`);
  const data = await res.json();

  const feed = document.getElementById("feed");

  data.posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "video";

    const video = document.createElement("video");
    video.src = post.videoUrl;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      ❤️ ${post.likes}
      <br>
      💬 ${post.comments.length}
    `;

    div.appendChild(video);
    div.appendChild(overlay);
    feed.appendChild(div);
  });

  initSwipe(feed);

  if (data.hasMore) page++;
  loading = false;

  setupVideoObserver();
}

// 🔥 ONLY PLAY 1 VIDEO (REAL TIKTOK BEHAVIOR)
function setupVideoObserver() {
  const videos = document.querySelectorAll("video");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.play();
      } else {
        entry.target.pause();
      }
    });
  }, { threshold: 0.8 });

  videos.forEach(v => observer.observe(v));
}

// upload
window.uploadVideo = async function () {
  const input = document.getElementById("fileInput");
  const file = input.files[0];

  const form = new FormData();
  form.append("video", file);

  await fetch("/upload", { method: "POST", body: form });

  location.reload();
};

loadFeed();