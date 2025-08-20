  const footerLink = document.getElementById("footerEmailLink");
  const footerForm = document.getElementById("footerContactForm");

  footerLink.addEventListener("click", function(e) {
    e.preventDefault(); // prevent default link behavior

    // Option 1: show a simple prompt to collect email & message
    const email = prompt("Your email:");
    const message = prompt("Your message:");

    if(email && message) {
      // Create hidden inputs for submission
      footerForm.innerHTML = `
        <input type="hidden" name="_subject" value="Website Contact Form Submission">
        <input type="hidden" name="_next" value="https://rokshelby.github.io/IPT-MO/project/thank-you.html">
        <input type="hidden" name="email" value="${email}">
        <input type="hidden" name="message" value="${message}">
      `;
      footerForm.submit();
    }
  });
