
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data/events.json');
    const events = await res.json();

    // Sort events by date
    const sortedEvents = events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Filter for upcoming only
    const today = new Date();
    const upcoming = sortedEvents.filter(e => new Date(e.startDate) >= today);

    // Take only first 2
    const nextTwo = upcoming.slice(0, 2);

    // Build HTML
    const eventsList = document.getElementById('events-list');
    if (nextTwo.length === 0) {
      eventsList.innerHTML = '<p>No upcoming events.</p>';
    } else {
      eventsList.innerHTML = nextTwo.map(e => `
        <div class="event">
          <div class="event-date">${new Date(e.startDate).toLocaleDateString()}</div>
          <div class="event-title">${e.title}</div>
          <div class="event-location">${e.location}</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading events:', err);
  }
});

