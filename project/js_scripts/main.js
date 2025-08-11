document.addEventListener("DOMContentLoaded", () => {
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      const headerPlaceholder = document.getElementById('header-placeholder');
      headerPlaceholder.innerHTML = data;

      // Highlight the current page's nav link
      const links = headerPlaceholder.querySelectorAll('nav a');
      const currentPage = window.location.pathname.split('/').pop();

      links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
          link.classList.add('active');
        }
      });

      // Setup nav toggle event listener here AFTER header is loaded
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

  fetch('footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(err => console.error('Error loading footer:', err));
});
