document.addEventListener("DOMContentLoaded", () => {
  const slideshow = document.querySelector(".slideshow");
  const slides = document.querySelectorAll(".slideshow .slide");
  if (!slides.length) return;

  // Create Prev/Next buttons and dots container dynamically
  const prevBtn = document.createElement("button");
  prevBtn.className = "prev";
  prevBtn.innerHTML = "&#10094;";
  slideshow.appendChild(prevBtn);

  const nextBtn = document.createElement("button");
  nextBtn.className = "next";
  nextBtn.innerHTML = "&#10095;";
  slideshow.appendChild(nextBtn);

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "dots";
  slideshow.appendChild(dotsContainer);

  // Create dots based on slides count
  slides.forEach((_, idx) => {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", () => {
      currentSlide(idx);
    });
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll(".dot");

  let slideIndex = 0;
  let timer;

  function showSlides(index = slideIndex) {
    if (index >= slides.length) slideIndex = 0;
    else if (index < 0) slideIndex = slides.length - 1;
    else slideIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === slideIndex);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === slideIndex);
    });
  }

  function nextSlide() {
    showSlides(slideIndex + 1);
    resetTimer();
  }

  function prevSlide() {
    showSlides(slideIndex - 1);
    resetTimer();
  }

  function currentSlide(n) {
    showSlides(n);
    resetTimer();
  }

  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => nextSlide(), 7500);
  }

  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);

  showSlides();
  resetTimer();
});
