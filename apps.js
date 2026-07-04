let feed = document.getElementById("feed");

async function loadVideos() {
  let { data } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  feed.innerHTML = "";

  data.forEach(video => {
    let div = document.createElement("div");
    div.className = "video";

    div.innerHTML = `
      <video src="${video.video_url}" muted loop></video>
      <div class="likeBtn" onclick="likeVideo('${video.id}')">❤️ ${video.likes}</div>
    `;

    feed.appendChild(div);
  });

  setupAutoPlay();
}

function setupAutoPlay() {
  let vids = document.querySelectorAll("video");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.play();
      else e.target.pause();
    });
  }, { threshold: 0.6 });

  vids.forEach(v => obs.observe(v));
}

async function likeVideo(id) {
  let { data } = await supabase
    .from("videos")
    .select("likes")
    .eq("id", id)
    .single();

  await supabase
    .from("videos")
    .update({ likes: data.likes + 1 })
    .eq("id", id);

  loadVideos();
}

function openUpload() {
  document.getElementById("uploadBox").classList.remove("hidden");
}

function closeUpload() {
  document.getElementById("uploadBox").classList.add("hidden");
}

async function uploadVideo() {
  let file = document.getElementById("fileInput").files[0];
  if (!file) return;

  let fileName = Date.now() + ".mp4";

  // upload to Supabase Storage
  await supabase.storage
    .from("videos")
    .upload(fileName, file);

  let { data } = supabase.storage
    .from("videos")
    .getPublicUrl(fileName);

  await supabase.from("videos").insert([
    {
      video_url: data.publicUrl,
      likes: 0
    }
  ]);

  closeUpload();
  loadVideos();
}

loadVideos();