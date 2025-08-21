const footerLink = document.getElementById("footerEmailLink");
const footerModal = document.getElementById("footerModal");

if (footerLink && footerModal) {
  const closeBtn = footerModal.querySelector(".close");
  footerLink.addEventListener("click", (e) => {
    e.preventDefault();
    footerModal.style.display = "flex"; // show modal
  });

  closeBtn.addEventListener("click", () => {
    footerModal.style.display = "none";
  });

  // Close if user clicks outside modal content
  window.addEventListener("click", (e) => {
    if (e.target === footerModal) {
      footerModal.style.display = "none";
    }
  });
}
