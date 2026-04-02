document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll(".image-slider");

  // ── helpers ───────────────────────────────────────────────────────────────
  function isVideo(src) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
  }

  function makeVideoEl() {
    const v = document.createElement("video");
    v.className   = "slider-main-video";
    v.muted       = true;
    v.autoplay    = true;
    v.loop        = true;
    v.playsInline = true;
    v.controls    = false;
    v.setAttribute("playsinline", "");
    return v;
  }

  // ── per-slider init ───────────────────────────────────────────────────────
  sliders.forEach((slider) => {
    const mediaList = (slider.dataset.images || "")
      .split(",").map((s) => s.trim()).filter(Boolean);

    if (mediaList.length === 0) return;

    let currentIndex = 0;

    const stage        = slider.querySelector(".slider-stage");
    const prevImage    = slider.querySelector(".slider-side-left");
    const nextImage    = slider.querySelector(".slider-side-right");
    const prevButton   = slider.querySelector(".slider-arrow.left");
    const nextButton   = slider.querySelector(".slider-arrow.right");
    const expandBtn    = slider.querySelector(".expand-media-button");
    const baseAlt      = slider.dataset.alt || "Slider image";
    const mainMediaDiv = slider.querySelector(".slider-main-media");

    let mainImg   = slider.querySelector(".slider-main-image");
    let mainVideo = slider.querySelector(".slider-main-video");

    function getOrMakeVideo() {
      if (!mainVideo) {
        mainVideo = makeVideoEl();
        if (mainMediaDiv)  mainMediaDiv.appendChild(mainVideo);
        else if (mainImg)  mainImg.insertAdjacentElement("afterend", mainVideo);
        else               stage?.appendChild(mainVideo);
      }
      return mainVideo;
    }

    function getOrMakeImg() {
      if (!mainImg) {
        mainImg = document.createElement("img");
        mainImg.className = "slider-main-image";
        mainImg.alt = baseAlt;
        if (mainMediaDiv) mainMediaDiv.appendChild(mainImg);
        else              stage?.appendChild(mainImg);
      }
      return mainImg;
    }

    function setStageAspectRatio() {
      if (!stage || slider.dataset.aspectSet === "true") return;
      const firstSrc = mediaList[0];
      if (isVideo(firstSrc)) { slider.dataset.aspectSet = "true"; return; }
      const img = new Image();
      img.src = firstSrc;
      img.onload = () => {
        stage.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        slider.dataset.aspectSet = "true";
      };
    }

    function updateSlider() {
      const src          = mediaList[currentIndex];
      const prevIndex    = (currentIndex - 1 + mediaList.length) % mediaList.length;
      const nextIndex    = (currentIndex + 1) % mediaList.length;
      const isSingle     = mediaList.length === 1;
      const showingVideo = isVideo(src);

      if (showingVideo) {
        const v = getOrMakeVideo();
        if (mainImg) mainImg.style.display = "none";
        v.style.display = "";
        v.src = src;
        v.load();
        const onCanPlay = () => {
          v.play().catch(() => {});
          v.removeEventListener("canplay", onCanPlay);
        };
        v.addEventListener("canplay", onCanPlay);
      } else {
        const img = getOrMakeImg();
        if (mainVideo) { mainVideo.pause(); mainVideo.style.display = "none"; }
        img.style.display = "";
        img.src = src;
        img.alt = `${baseAlt} ${currentIndex + 1}`;
      }

      if (prevImage) {
        const ps = mediaList[prevIndex];
        if (isSingle || isVideo(ps)) { prevImage.style.display = "none"; }
        else { prevImage.src = ps; prevImage.alt = `Previous ${baseAlt}`; prevImage.style.display = ""; }
      }
      if (nextImage) {
        const ns = mediaList[nextIndex];
        if (isSingle || isVideo(ns)) { nextImage.style.display = "none"; }
        else { nextImage.src = ns; nextImage.alt = `Next ${baseAlt}`; nextImage.style.display = ""; }
      }

      if (prevButton) prevButton.style.display = isSingle ? "none" : "";
      if (nextButton) nextButton.style.display = isSingle ? "none" : "";
      stage?.classList.toggle("slider-stage--video", showingVideo);
    }

    function changeMedia(direction) {
      currentIndex = (currentIndex + direction + mediaList.length) % mediaList.length;
      updateSlider();
    }

    if (prevButton) prevButton.addEventListener("click", () => changeMedia(-1));
    if (nextButton) nextButton.addEventListener("click", () => changeMedia(1));
    if (prevImage)  prevImage.addEventListener("click",  () => changeMedia(-1));
    if (nextImage)  nextImage.addEventListener("click",  () => changeMedia(1));

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  changeMedia(-1);
      if (e.key === "ArrowRight") changeMedia(1);
    });
    slider.setAttribute("tabindex", "0");

    // Attach current-src getters to the button so expand-media.js can read them
    if (expandBtn) {
      expandBtn._getMediaSrc = () =>
        (mainVideo && mainVideo.style.display !== "none" && mainVideo.src)
          ? mainVideo.src
          : mainImg?.getAttribute("src");
      expandBtn._getMediaAlt = () =>
        mainImg?.getAttribute("alt") || baseAlt;
    }

    setStageAspectRatio();
    updateSlider();
  });
});