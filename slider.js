document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll(".image-slider");

  // ── helpers ──────────────────────────────────────────────────────────────
  function isVideo(src) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
  }

  /**
   * Make or recycle a <video> element for the main slot.
   * We reuse one element per slider so the browser doesn't re-create it on
   * every slide change (avoids a flash and keeps autoplay working on iOS).
   */
  function makeVideoEl() {
    const v = document.createElement("video");
    v.className   = "slider-main-video";
    v.muted       = true;
    v.autoplay    = true;
    v.loop        = true;
    v.playsInline = true;
    v.controls    = false;   // arrows navigate; use expand modal for controls
    v.setAttribute("playsinline", "");
    return v;
  }

  // ── modal (shared across all sliders) ────────────────────────────────────
  const modal      = document.getElementById("mediaExpandModal");
  const modalClose = document.getElementById("mediaExpandClose");
  const modalImg   = modal?.querySelector(".media-expand-image");

  // We'll inject a modal <video> element once, lazily
  let modalVideo = modal?.querySelector(".media-expand-video");
  if (modal && !modalVideo) {
    modalVideo            = document.createElement("video");
    modalVideo.className  = "media-expand-video";
    modalVideo.controls   = true;
    modalVideo.loop       = true;
    modalVideo.playsInline= true;
    modalVideo.setAttribute("playsinline", "");
    modalVideo.style.display = "none";
    modal.querySelector(".media-expand-dialog")?.appendChild(modalVideo);
  }

  function openModal(src) {
    if (!modal) return;
    if (isVideo(src)) {
      if (modalImg)   { modalImg.style.display   = "none"; modalImg.src   = ""; }
      if (modalVideo) {
        modalVideo.style.display = "";
        modalVideo.src           = src;
        modalVideo.play().catch(() => {});
      }
    } else {
      if (modalVideo) { modalVideo.style.display = "none"; modalVideo.pause(); modalVideo.src = ""; }
      if (modalImg)   { modalImg.style.display   = ""; modalImg.src = src; }
    }
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("media-expand-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("media-expand-open");
    if (modalVideo) { modalVideo.pause(); modalVideo.src = ""; }
    if (modalImg)   { modalImg.src = ""; }
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  modal?.querySelector(".media-expand-overlay")
        ?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ── per-slider init ───────────────────────────────────────────────────────
  sliders.forEach((slider) => {
    const mediaList = (slider.dataset.images || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (mediaList.length === 0) return;

    let currentIndex = 0;

    const stage       = slider.querySelector(".slider-stage");
    const prevImage   = slider.querySelector(".slider-side-left");
    const nextImage   = slider.querySelector(".slider-side-right");
    const prevButton  = slider.querySelector(".slider-arrow.left");
    const nextButton  = slider.querySelector(".slider-arrow.right");
    const expandBtn   = slider.querySelector(".expand-media-button");
    const baseAlt     = slider.dataset.alt || "Slider image";

    // ── main media slot ──────────────────────────────────────────────────
    // Support both old HTML (img.slider-main-image) and new HTML
    // (div.slider-main-media).  We replace/insert as needed.
    let mainImg   = slider.querySelector(".slider-main-image");
    let mainVideo = slider.querySelector(".slider-main-video");

    // If there's a div.slider-main-media placeholder, we'll inject into it
    const mainMediaDiv = slider.querySelector(".slider-main-media");

    function getOrMakeVideo() {
      if (!mainVideo) {
        mainVideo = makeVideoEl();
        if (mainMediaDiv) {
          mainMediaDiv.appendChild(mainVideo);
        } else if (mainImg) {
          mainImg.insertAdjacentElement("afterend", mainVideo);
        } else {
          stage?.appendChild(mainVideo);
        }
      }
      return mainVideo;
    }

    function getOrMakeImg() {
      if (!mainImg) {
        mainImg = document.createElement("img");
        mainImg.className = "slider-main-image";
        mainImg.alt = baseAlt;
        if (mainMediaDiv) {
          mainMediaDiv.appendChild(mainImg);
        } else {
          stage?.appendChild(mainImg);
        }
      }
      return mainImg;
    }

    // ── aspect ratio (from first image; videos self-size) ────────────────
    function setStageAspectRatio() {
      if (!stage || slider.dataset.aspectSet === "true") return;
      const firstSrc = mediaList[0];
      if (isVideo(firstSrc)) {
        // Let the video's natural ratio drive the stage height
        slider.dataset.aspectSet = "true";
        return;
      }
      const img = new Image();
      img.src = firstSrc;
      img.onload = () => {
        stage.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        slider.dataset.aspectSet = "true";
      };
    }

    // ── render current slide ──────────────────────────────────────────────
    function updateSlider() {
      const src         = mediaList[currentIndex];
      const prevIndex   = (currentIndex - 1 + mediaList.length) % mediaList.length;
      const nextIndex   = (currentIndex + 1) % mediaList.length;
      const isSingle    = mediaList.length === 1;
      const showingVideo = isVideo(src);

      // — main media —
      if (showingVideo) {
        // Show video, hide image
        const v = getOrMakeVideo();
        const img = mainImg;
        if (img) { img.style.display = "none"; }
        v.style.display = "";
        v.src = src;
        v.load();
        // Stage aspect ratio stays fixed (set from the first image) —
        // the video uses object-fit: cover to fill it without bars.
        const onCanPlay = () => {
          v.play().catch(() => {});
          v.removeEventListener("canplay", onCanPlay);
        };
        v.addEventListener("canplay", onCanPlay);
      } else {
        // Show image, hide / pause video
        const img = getOrMakeImg();
        if (mainVideo) {
          mainVideo.pause();
          mainVideo.style.display = "none";
        }
        img.style.display = "";
        img.src = src;
        img.alt = `${baseAlt} ${currentIndex + 1}`;
      }

      // — side previews (images only; never show a video thumbnail) —
      if (prevImage) {
        const ps = mediaList[prevIndex];
        if (isSingle || isVideo(ps)) {
          prevImage.style.display = "none";
        } else {
          prevImage.src   = ps;
          prevImage.alt   = `Previous ${baseAlt}`;
          prevImage.style.display = "";
        }
      }

      if (nextImage) {
        const ns = mediaList[nextIndex];
        if (isSingle || isVideo(ns)) {
          nextImage.style.display = "none";
        } else {
          nextImage.src   = ns;
          nextImage.alt   = `Next ${baseAlt}`;
          nextImage.style.display = "";
        }
      }

      // — arrows —
      if (prevButton) prevButton.style.display = isSingle ? "none" : "";
      if (nextButton) nextButton.style.display = isSingle ? "none" : "";

      // — video badge on stage —
      stage?.classList.toggle("slider-stage--video", showingVideo);
    }

    // ── navigation ────────────────────────────────────────────────────────
    function changeMedia(direction) {
      currentIndex = (currentIndex + direction + mediaList.length) % mediaList.length;
      updateSlider();
    }

    if (prevButton)  prevButton.addEventListener("click",  () => changeMedia(-1));
    if (nextButton)  nextButton.addEventListener("click",  () => changeMedia(1));
    if (prevImage)   prevImage.addEventListener("click",   () => changeMedia(-1));
    if (nextImage)   nextImage.addEventListener("click",   () => changeMedia(1));

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  changeMedia(-1);
      if (e.key === "ArrowRight") changeMedia(1);
    });
    slider.setAttribute("tabindex", "0");

    // ── expand button ──────────────────────────────────────────────────────
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        openModal(mediaList[currentIndex]);
      });
    }

    // ── boot ──────────────────────────────────────────────────────────────
    setStageAspectRatio();
    updateSlider();
  });
});