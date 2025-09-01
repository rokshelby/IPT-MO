document.addEventListener("DOMContentLoaded", () => {
  // Load header
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      const headerPlaceholder = document.getElementById('header-placeholder');
      headerPlaceholder.innerHTML = data;

      // Highlight current page's nav link
      const links = headerPlaceholder.querySelectorAll('nav a');
      const currentPage = window.location.pathname.split('/').pop();
      links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
          link.classList.add('active');
        }
      });

      // Nav toggle
      const navToggle = document.getElementById('nav-toggle');
      const nav = headerPlaceholder.querySelector('nav');
      if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
          const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
          navToggle.setAttribute('aria-expanded', !expanded);
          nav.classList.toggle('active');
        });
      }
    })
    .catch(err => console.error('Error loading header:', err));

  // Load footer
  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;

      // NOW load footer.js dynamically
      const script = document.createElement("script");
      script.src = "js_scripts/footer.js";
      document.body.appendChild(script);
    })
    .catch(err => console.error('Error loading footer:', err));

// Smooth parallax scroll using requestAnimationFrame
let latestScrollY = 0;

document.addEventListener("scroll", () => {
  latestScrollY = window.scrollY;
});

function updateParallax() {
  const parallaxY = latestScrollY * 0.2; // adjust speed
  // Instead, use CSS variable
  document.documentElement.style.setProperty('--parallax-y', `${parallaxY}px`);
  requestAnimationFrame(updateParallax);
}

updateParallax();

});
