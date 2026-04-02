document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("mediaExpandModal");
  const modalImage = document.getElementById("mediaExpandImage");
  const closeButton = document.getElementById("mediaExpandClose");
  const overlay = modal ? modal.querySelector(".media-expand-overlay") : null;

  if (!modal || !closeButton || !overlay) return;

  // Inject a modal video element once
  let modalVideo = modal.querySelector(".media-expand-video");
  if (!modalVideo) {
    modalVideo = document.createElement("video");
    modalVideo.className = "media-expand-video";
    modalVideo.controls = true;
    modalVideo.loop = true;
    modalVideo.playsInline = true;
    modalVideo.setAttribute("playsinline", "");
    modalVideo.style.display = "none";
    modal.querySelector(".media-expand-dialog")?.appendChild(modalVideo);
  }

  function isVideo(src) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
  }

  function openModal(src, alt = "Expanded media") {
    if (isVideo(src)) {
      if (modalImage) { modalImage.style.display = "none"; modalImage.src = ""; }
      modalVideo.style.display = "";
      modalVideo.src = src;
      modalVideo.play().catch(() => {});
    } else {
      modalVideo.style.display = "none";
      modalVideo.pause();
      modalVideo.src = "";
      if (modalImage) {
        modalImage.style.display = "";
        modalImage.src = src;
        modalImage.alt = alt;
      }
    }
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("media-expand-open");
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("media-expand-open");
    modalVideo.pause();
    modalVideo.src = "";
    if (modalImage) { modalImage.src = ""; modalImage.alt = ""; }
  }

  /* SLIDER IMAGES & VIDEOS */
  document.querySelectorAll(".image-slider").forEach((slider) => {
    const expandButton = slider.querySelector(".expand-media-button");
    const mainImage = slider.querySelector(".slider-main-image");
    const mainVideo = slider.querySelector(".slider-main-video");

    if (!expandButton) return;

    expandButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Prefer the active video src, fall back to the image src
      const src = (mainVideo && mainVideo.style.display !== "none" && mainVideo.src)
        ? mainVideo.src
        : mainImage?.getAttribute("src");

      const alt = mainImage?.getAttribute("alt") || slider.dataset.alt || "Expanded media";

      if (src) openModal(src, alt);
    });
  });

  /* STANDALONE IMAGES */
  document.querySelectorAll(".expandable-media").forEach((container) => {
    const img = container.querySelector("img");
    const button = container.querySelector(".expand-media-button");

    if (!img || !button) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const src = img.getAttribute("src");
      const alt = img.getAttribute("alt") || "Expanded image";

      if (src) openModal(src, alt);
    });
  });

  closeButton.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  // ── video-text-showcase: match all videos to the first video's ratio ───
  document.querySelectorAll(".video-text-showcase-card").forEach((card) => {
    const videos = card.querySelectorAll(".video-text-side video");
    if (videos.length < 2) return;

    const first = videos[0];
    function applyRatio() {
      if (!first.videoWidth || !first.videoHeight) return;
      const ratio = `${first.videoWidth} / ${first.videoHeight}`;
      videos.forEach((v) => {
        v.style.aspectRatio = ratio;
      });
    }

    if (first.readyState >= 1) {
      applyRatio();
    } else {
      first.addEventListener("loadedmetadata", applyRatio);
    }
  });
});