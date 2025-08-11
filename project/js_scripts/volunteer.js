const form = document.getElementById('volunteerForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('Thank you for signing up to volunteer! We will be in touch soon.');
      form.reset();
    });