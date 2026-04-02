document.addEventListener("DOMContentLoaded", () => {
  const modal    = document.getElementById("mediaExpandModal");
  const modalImg = document.getElementById("mediaExpandImage");
  const closeBtn = document.getElementById("mediaExpandClose");
  const overlay  = modal?.querySelector(".media-expand-overlay");

  if (!modal || !closeBtn || !overlay) return;

  // Inject a <video> element into the dialog once
  let modalVideo = modal.querySelector(".media-expand-video");
  if (!modalVideo) {
    modalVideo             = document.createElement("video");
    modalVideo.className   = "media-expand-video";
    modalVideo.controls    = true;
    modalVideo.loop        = true;
    modalVideo.playsInline = true;
    modalVideo.setAttribute("playsinline", "");
    modalVideo.style.display = "none";
    modal.querySelector(".media-expand-dialog")?.appendChild(modalVideo);
  }

  function isVideo(src) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
  }

  function openModal(src, alt) {
    alt = alt || "Expanded media";

    if (isVideo(src)) {
      if (modalImg) { modalImg.style.display = "none"; modalImg.src = ""; }

      // Reset any previous inline sizing
      modalVideo.style.display = "none";
      modalVideo.style.width   = "";
      modalVideo.style.height  = "";
      modalVideo.src = src;
      modalVideo.load();

      modalVideo.addEventListener("loadedmetadata", () => {
        const vw = modalVideo.videoWidth;
        const vh = modalVideo.videoHeight;

        if (vw && vh) {
          // Calculate the largest size that fits within 90vw x 85vh
          // while preserving the video's exact aspect ratio
          const maxW = window.innerWidth  * 0.90;
          const maxH = window.innerHeight * 0.85;
          const scale = Math.min(maxW / vw, maxH / vh, 1);

          modalVideo.style.width  = Math.round(vw * scale) + "px";
          modalVideo.style.height = Math.round(vh * scale) + "px";
        }

        modalVideo.style.display = "block";
        modalVideo.play().catch(() => {});
      }, { once: true });

    } else {
      if (modalVideo) { modalVideo.style.display = "none"; modalVideo.pause(); modalVideo.src = ""; }
      if (modalImg)   { modalImg.style.display = "block"; modalImg.src = src; modalImg.alt = alt; }
    }

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("media-expand-open");
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("media-expand-open");
    if (modalVideo) { modalVideo.pause(); modalVideo.src = ""; modalVideo.style.display = "none"; }
    if (modalImg)   { modalImg.src = ""; modalImg.alt = ""; modalImg.style.display = "none"; }
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });

  // ── slider expand buttons ─────────────────────────────────────────────────
  document.querySelectorAll(".image-slider .expand-media-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const src = btn._getMediaSrc?.();
      const alt = btn._getMediaAlt?.();
      if (src) openModal(src, alt);
    });
  });

  // ── standalone expandable media (.expandable-media) ───────────────────────
  document.querySelectorAll(".expandable-media").forEach((container) => {
    const img   = container.querySelector("img");
    const video = container.querySelector("video");
    const btn   = container.querySelector(".expand-media-button");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const src = video
        ? (video.querySelector("source")?.getAttribute("src") || video.getAttribute("src"))
        : img?.getAttribute("src");
      const alt = img?.getAttribute("alt") || "Expanded media";
      if (src) openModal(src, alt);
    });
  });

  // ── video-text-showcase: sync all videos to first video's aspect ratio ────
  document.querySelectorAll(".video-text-showcase-card").forEach((card) => {
    const videos = card.querySelectorAll(".video-text-side video");
    if (videos.length < 2) return;
    const first = videos[0];
    function applyRatio() {
      if (!first.videoWidth || !first.videoHeight) return;
      const ratio = `${first.videoWidth} / ${first.videoHeight}`;
      videos.forEach((v) => { v.style.aspectRatio = ratio; });
    }
    if (first.readyState >= 1) applyRatio();
    else first.addEventListener("loadedmetadata", applyRatio);
  });
});