document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".events-container");
  const toggleLink = document.getElementById('toggleEventsLink');
  let allEvents = [];
  let showingAll = false;

  if (!container) return console.warn("No .events-container found in DOM");
  if (!toggleLink) return console.warn("No #toggleEventsLink found in DOM");

  // Single check for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const eventsPath = isIOS ? "/project/data/events.json" : "data/events.json";

  fetch(eventsPath)
    .then(res => res.json())
    .then(events => {
      // Parse dates and generate URLs
      events.forEach((ev, idx) => {
        const [month, day, year] = ev.startDate.split("/").map(Number);
        ev.parsedDate = new Date(year, month - 1, day);
        ev.mapsUrl = generateMapsUrl(ev);
        ev.calendarUrl = generateCalendarUrl(ev);
        ev._idx = idx; // stable index
      });

      // Sort ascending by date
      events.sort((a, b) => a.parsedDate - b.parsedDate);
      allEvents = events;

      // Render initial 4 events
      renderEvents(allEvents.slice(0, 4), true);
      toggleLink.textContent = "View All Events →";

      // Toggle show all / show less
      toggleLink.addEventListener("click", e => {
        e.preventDefault();
        showingAll = !showingAll;
        if (showingAll) {
          renderEvents(allEvents, true);
          toggleLink.textContent = "Show Less ↑";
        } else {
          renderEvents(allEvents.slice(0, 4), true);
          toggleLink.textContent = "View All Events →";
        }
      });
    })
    .catch(err => console.error("Failed to load events:", err));

  // ---------------- Helpers ----------------
  function clearEvents() {
    container.innerHTML = "";
  }

  function getWeekdayName(date) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }

  function escapeICSText(s = "") {
    return String(s).replace(/\r\n|\n/g, "\\n").replace(/,/g, "\\,");
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

  function renderEvents(eventsToRender, showWeekday = false) {
    clearEvents();

    eventsToRender.forEach(event => {
      const formattedStartTime = formatTime24to12(event.startTime);
      const formattedEndTime = formatTime24to12(event.endTime);
      const weekdayText = showWeekday ? `${getWeekdayName(event.parsedDate)}, ` : "";
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const formattedDate = event.parsedDate.toLocaleDateString(undefined, options);

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
              <p class="address"><strong>Address:</strong> ${event.address || ""}</p>
            </div>

            <a class="learn-more" href="#">Learn More</a>
          </div>
        </div>
      `;
      container.appendChild(card);

      // --- Calendar Link Handler ---
      const calLink = card.querySelector('.calendar-link');
      if (calLink) {
        calLink.addEventListener('click', e => {
          const idx = Number(calLink.dataset.eventIndex);
          const evt = allEvents[idx];
          if (!evt) return console.error("Event not found for index", idx);

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

      // --- Learn More Flip Handler ---
      const learnMoreBtn = card.querySelector('.learn-more');
      if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', e => {
          e.stopPropagation();
          card.classList.add('flip');

          const handleOutsideClick = event => {
            if (!card.contains(event.target)) {
              card.classList.remove('flip');
              document.removeEventListener('click', handleOutsideClick);
            }
          };

          document.addEventListener('click', handleOutsideClick);
        });
      }

    });
  }
});
