document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll(".image-slider");

  sliders.forEach((slider) => {
    const imageList = (slider.dataset.images || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (imageList.length === 0) return;

    let currentIndex = 0;

    const stage = slider.querySelector(".slider-stage");
    const mainImage = slider.querySelector(".slider-main-image");
    const prevImage = slider.querySelector(".slider-side-left");
    const nextImage = slider.querySelector(".slider-side-right");
    const prevButton = slider.querySelector(".slider-arrow.left");
    const nextButton = slider.querySelector(".slider-arrow.right");
    const baseAlt = slider.dataset.alt || "Slider image";

    function setStageAspectRatioFromFirstImage() {
      if (!stage || slider.dataset.aspectSet === "true") return;

      const firstImage = new Image();
      firstImage.src = imageList[0];

      firstImage.onload = () => {
        stage.style.aspectRatio = `${firstImage.naturalWidth} / ${firstImage.naturalHeight}`;
        slider.dataset.aspectSet = "true";
      };
    }

    function updateSlider() {
      const prevIndex = (currentIndex - 1 + imageList.length) % imageList.length;
      const nextIndex = (currentIndex + 1) % imageList.length;
      const isSingleImage = imageList.length === 1;

      if (mainImage) {
        mainImage.src = imageList[currentIndex];
        mainImage.alt = `${baseAlt} ${currentIndex + 1}`;
      }

      if (prevImage) {
        prevImage.src = imageList[prevIndex];
        prevImage.alt = `Previous ${baseAlt}`;
        prevImage.style.display = isSingleImage ? "none" : "";
      }

      if (nextImage) {
        nextImage.src = imageList[nextIndex];
        nextImage.alt = `Next ${baseAlt}`;
        nextImage.style.display = isSingleImage ? "none" : "";
      }

      if (prevButton) {
        prevButton.style.display = isSingleImage ? "none" : "";
      }

      if (nextButton) {
        nextButton.style.display = isSingleImage ? "none" : "";
      }
    }

    function changeImage(direction) {
      currentIndex += direction;

      if (currentIndex < 0) currentIndex = imageList.length - 1;
      if (currentIndex >= imageList.length) currentIndex = 0;

      updateSlider();
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => changeImage(-1));
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => changeImage(1));
    }

    if (prevImage) {
      prevImage.addEventListener("click", () => changeImage(-1));
    }

    if (nextImage) {
      nextImage.addEventListener("click", () => changeImage(1));
    }

    slider.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") changeImage(-1);
      if (event.key === "ArrowRight") changeImage(1);
    });

    slider.setAttribute("tabindex", "0");

    setStageAspectRatioFromFirstImage();
    updateSlider();
  });
});