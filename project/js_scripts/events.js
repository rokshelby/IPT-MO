// events.js

// ----------- Helpers (Global) -----------

function escapeICSText(s = "") {
  return String(s).replace(/\r\n|\n/g, "\\n").replace(/,/g, "\\,");
}

function formatDate(d) {
  const pad = (num) => num.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function createICSFromEvent(evt) {
  const start = evt.parsedDate instanceof Date && !isNaN(evt.parsedDate) ? evt.parsedDate : new Date();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const summary = escapeICSText(evt.title || "Event");
  const location = escapeICSText(evt.address || evt.location || "");
  const description = escapeICSText(evt.description || "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourSite//Events//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@yoursite.local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.\"]/g, "")}`,
    `DTSTART;VALUE=DATE:${formatDate(start)}`,
    `DTEND;VALUE=DATE:${formatDate(end)}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.join("\r\n");
}

function generateCalendarUrl(event) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const icsContent = createICSFromEvent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  } else {
    function toUTCString(dateStr, timeStr) {
      const [month, day, year] = dateStr.split("/").map(Number);
      const [hour, minute] = timeStr.split(":").map(Number);
      const centralOffset = 6 * 60; // CST
      let dateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));
      dateUTC = new Date(dateUTC.getTime() + centralOffset * 60 * 1000);
      const pad = (num) => num.toString().padStart(2, "0");
      return (
        dateUTC.getUTCFullYear().toString() +
        pad(dateUTC.getUTCMonth() + 1) +
        pad(dateUTC.getUTCDate()) +
        "T" +
        pad(dateUTC.getUTCHours()) +
        pad(dateUTC.getUTCMinutes()) +
        pad(dateUTC.getUTCSeconds()) +
        "Z"
      );
    }

    const start = toUTCString(event.startDate, event.startTime);
    const end = toUTCString(event.endDate, event.endTime);
    const locationStr = `${event.address}, ${event.city}, ${event.state} ${event.zip}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(event.title)}` +
      `&dates=${start}/${end}` +
      `&location=${encodeURIComponent(locationStr)}` +
      (event.description ? `&details=${encodeURIComponent(event.description)}` : '');
  }
}

function generateMapsUrl(evt) {
  const address = encodeURIComponent(`${evt.address}, ${evt.city}, ${evt.state} ${evt.zip}`);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS 
    ? `http://maps.apple.com/?q=${address}`
    : `https://www.google.com/maps/search/?api=1&query=${address}`;
}

function formatTime24to12(time24) {
  if (!time24) return "";
  let [hour, minute] = time24.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// ----------- DOMContentLoaded -----------

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".events-container");
  const toggleLink = document.getElementById('toggleEventsLink');
  let allEvents = [];
  let showingAll = false;
  let activeCard = null; // track which card opened the modal

  if (!container) return console.warn("No .events-container found in DOM");
  if (!toggleLink) return console.warn("No #toggleEventsLink found in DOM");

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const eventsPath = "data/events.json";
  




  // modal elements
  const modal = document.getElementById("eventModal");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");
  const modalDate = document.getElementById("modalDate");
  const modalTime = document.getElementById("modalTime");
  const modalLocation = document.getElementById("modalLocation");
  const modalDescription = document.getElementById("modalDescription");

  // --- Modal Close Function ---
  function closeModal() {
    if (!activeCard) return;
    const cardInner = activeCard.querySelector(".card-inner");
    const duration = parseFloat(getComputedStyle(cardInner).transitionDuration) * 1000;

    activeCard.classList.remove("flip");

    setTimeout(() => {
      modal.style.display = "none";
      activeCard = null;
    }, duration);
  }

  modalClose.onclick = closeModal;
  modal.onclick = e => {
    if (e.target === modal) closeModal();
  };

  // fetch events
  fetch(eventsPath)
    .then(res => res.json())
    .then(events => {
      const today = new Date();
      events.forEach((ev, idx) => {
        const [month, day, year] = ev.startDate.split("/").map(Number);
        ev.parsedDate = new Date(year, month - 1, day);
        ev.mapsUrl = generateMapsUrl(ev);
        ev.calendarUrl = generateCalendarUrl(ev);
        ev._idx = idx;
      });

      const upcomingEvents = events.filter(event => {
        const eventEnd = new Date(event.endDate);
        return eventEnd >= today;
      });

      upcomingEvents.sort((a, b) => a.parsedDate - b.parsedDate);
      allEvents = upcomingEvents;

      renderEvents(allEvents.slice(0, 4), true);
      toggleLink.textContent = "View All Events →";

      toggleLink.addEventListener("click", e => {
        e.preventDefault();
        showingAll = !showingAll;
        renderEvents(showingAll ? allEvents : allEvents.slice(0, 4), true);
        toggleLink.textContent = showingAll ? "Show Less ↑" : "View All Events →";
      });
    })
    .catch(err => console.error("Failed to load events:", err));

  // --- Render Events ---
  function clearEvents() {
    container.innerHTML = "";
  }

  function getWeekdayName(date) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }

  function renderEvents(eventsToRender, showWeekday = false) {
    clearEvents();

    eventsToRender.forEach(event => {
      const formattedStartTime = formatTime24to12(event.startTime);
      const formattedEndTime = formatTime24to12(event.endTime);
      const weekdayText = showWeekday ? `${getWeekdayName(event.parsedDate)}, ` : "";
      const formattedDate = event.parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <h3 class="event-title">${event.title}</h3>

            <div class="event-detail">
              <a href="${event.calendarUrl}" class="calendar-link" data-event-index="${event._idx}" title="Add to calendar">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="sprites/icons.svg#icon-calendar"></use>
                </svg>
                <div class="calendar-text">
                  <div class="date-line"><strong>Date:</strong> <span>${weekdayText}${formattedDate}</span></div>
                  <div class="time-line"><strong>Time:</strong> <span>${formattedStartTime} - ${formattedEndTime}</span></div>
                </div>
              </a>
            </div>

            <div class="event-detail">
              <a href="${event.mapsUrl}" target="_blank" rel="noopener noreferrer" title="Open location in maps">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="sprites/icons.svg#icon-location"></use>
                </svg>
                <span>${event.address}, ${event.city}, ${event.state} ${event.zip}</span>
              </a>
            </div>

            <div class="detail-text">
              <p class="description"><strong>Description:</strong> ${event.description || ""}</p>
            </div>

            <a class="learn-more" href="#">Learn More</a>
          </div>
        </div>
      `;
      container.appendChild(card);

      // --- Calendar Link ---
      const calLink = card.querySelector('.calendar-link');
      if (calLink) {
        calLink.addEventListener('click', e => {
          const idx = Number(calLink.dataset.eventIndex);
          const evt = allEvents[idx];
          if (!evt) return;

          if (isIOS) {
            e.preventDefault();
            const icsContent = createICSFromEvent(evt);
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = (evt.title || 'event').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'event';
            a.download = `${safeName}.ics`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }
        });
      }

      // --- Learn More: Flip + Modal ---
      const learnMoreBtn = card.querySelector('.learn-more');
      if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();

          activeCard = card;
          card.classList.add('flip');

          const cardInner = card.querySelector('.card-inner');
          const duration = parseFloat(getComputedStyle(cardInner).transitionDuration) * 1000;

          setTimeout(() => {
            modal.style.display = 'flex';
            modalTitle.textContent = event.title;
            modalDate.textContent = `Date: ${formattedDate}`;
            modalTime.textContent = `Time: ${formattedStartTime} - ${formattedEndTime}`;
            modalLocation.textContent = `Location: ${event.address}, ${event.city}, ${event.state} ${event.zip}`;
            modalDescription.textContent = event.description || '';

            if (event.image && event.image.trim() !== '') {
              modalImage.src = event.image;   // assuming you have an <img id="modalImage">
              modalImage.style.display = 'block';
            } else {
              modalImage.style.display = 'none';
            }

          }, duration);
        });
      }
    });
  }
});
