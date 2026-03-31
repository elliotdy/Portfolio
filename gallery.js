document.addEventListener("DOMContentLoaded", () => {
  const galleryItems = document.querySelectorAll(".universal-gallery-item");
  const galleryVideos = document.querySelectorAll(".universal-gallery-item video");
  const lightbox = document.getElementById("universalLightbox");
  const lightboxContent = document.getElementById("universalLightboxContent");
  const lightboxCaption = document.getElementById("universalLightboxCaption");
  const closeBtn = document.getElementById("universalLightboxClose");
  const prevBtn = document.getElementById("universalPrevBtn");
  const nextBtn = document.getElementById("universalNextBtn");

  if (!galleryItems.length || !lightbox || !lightboxContent || !lightboxCaption) return;

  let currentIndex = 0;

  galleryVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
  });

  function stopAllGalleryVideos() {
    galleryVideos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    });

    const lightboxVideo = lightboxContent.querySelector("video");
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.currentTime = 0;
      lightboxVideo.muted = true;
    }
  }

  function renderLightboxItem(index) {
    currentIndex = index;
    const item = galleryItems[currentIndex];
    const type = item.dataset.type;
    const src = item.dataset.src;
    const caption = item.dataset.caption || "";

    lightboxContent.innerHTML = "";

    if (type === "image") {
      const img = document.createElement("img");
      img.className = "universal-lightbox-img";
      img.src = src;
      img.alt = caption;
      lightboxContent.appendChild(img);
    } else if (type === "video") {
      const video = document.createElement("video");
      video.className = "universal-lightbox-video";
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.muted = true;
      video.defaultMuted = true;
      video.preload = "auto";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      lightboxContent.appendChild(video);
    }

    lightboxCaption.textContent = caption;
    lightboxContent.appendChild(lightboxCaption);
  }

  function openLightbox(index) {
    stopAllGalleryVideos();
    renderLightboxItem(index);
    lightbox.classList.add("show");
    document.body.classList.add("universal-lightbox-open");
  }

  function closeLightbox() {
    stopAllGalleryVideos();
    lightbox.classList.remove("show");
    document.body.classList.remove("universal-lightbox-open");
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      renderLightboxItem(currentIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % galleryItems.length;
      renderLightboxItem(currentIndex);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      renderLightboxItem(currentIndex);
    } else if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      renderLightboxItem(currentIndex);
    }
  });
});