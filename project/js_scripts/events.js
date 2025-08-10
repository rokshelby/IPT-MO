document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".events-container");
  const viewAllBtn = document.querySelector(".full-events-link");
  let allEvents = [];

  fetch("data/events.json")
    .then(res => res.json())
    .then(events => {
      // Parse dates
      events.forEach(ev => {
        const parts = ev.date.split("/"); // MM/DD/YY format
        const year = Number(parts[2]) < 50 ? 2000 + Number(parts[2]) : 1900 + Number(parts[2]);
        ev.parsedDate = new Date(year, parts[0] - 1, parts[1]);
      });

      // Sort ascending
      events.sort((a, b) => a.parsedDate - b.parsedDate);
      allEvents = events;

      // Show first 4 with weekday
      renderEvents(allEvents.slice(0, 4), true);

      // Setup click handler after loading events
      viewAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        renderEvents(allEvents.slice(4), true);
        viewAllBtn.style.display = "none";
      });
    })
    .catch(err => {
      console.error("Failed to load events:", err);
    });

  function getWeekdayName(date) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }

  function renderEvents(events, showWeekday = false) {
    events.forEach(event => {
      const weekdayText = showWeekday ? `${getWeekdayName(event.parsedDate)}, ` : "";
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <h3 class="event-title">${event.title}</h3>
        <div class="event-detail">
          <svg class="icon">
            <use xlink:href="sprites/icons.svg#icon-calendar"></use>
          </svg>
          <p><strong>Date:</strong> <span>${weekdayText}${event.date}</span></p>
        </div>
        <div class="event-detail">
          <svg class="icon">
            <use xlink:href="sprites/icons.svg#icon-location"></use>
          </svg>
          <p><strong>Location:</strong> <span>${event.location}</span></p>
        </div>
        <div class="detail-text">
          <p class="description"><strong>Description:</strong> ${event.description}</p>
          <p class="address"><strong>Address:</strong> ${event.address}</p>
        </div>
        <a class="learn-more" href="#">Learn More</a>
      `;
      container.appendChild(card);
    });
  }
});
