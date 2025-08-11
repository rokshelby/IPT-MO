function generateMapsUrl(event) {
  const query = `${event.street}, ${event.city}, ${event.state} ${event.zip}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function generateCalendarUrl(event) {
  // Helper: parse date and time strings in Central Time and get UTC ISO format for calendar
  function toUTCString(dateStr, timeStr) {
    // dateStr: "MM/DD/YYYY"
    // timeStr: "HH:mm" 24h format
    
    const [month, day, year] = dateStr.split("/").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);
    
    // Create a Date object in Central Time using Date.UTC + offset fix
    // We first create a date in UTC with those components as if local
    // Then subtract Central Time offset (in milliseconds)
    
    // Central Time offset (standard: UTC-6, daylight: UTC-5)
    // We’ll assume Central Standard Time (UTC-6) for simplicity or
    // you can adjust with a library like moment-timezone for DST
    
    // For now, let's just assume CST = UTC-6
    const centralOffset = 6 * 60; // in minutes
    
    // Create date as if in local time (UTC)
    let dateUTC = new Date(Date.UTC(year, month -1, day, hour, minute));
    
    // Adjust date to UTC by adding offset minutes (so effectively, CST->UTC)
    dateUTC = new Date(dateUTC.getTime() + centralOffset * 60 * 1000);

    // Format to YYYYMMDDTHHMMSSZ (Google Calendar expects UTC time with 'Z')
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

  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${start}/${end}` +
    `&location=${encodeURIComponent(locationStr)}` +
    (event.description ? `&details=${encodeURIComponent(event.description)}` : '');

  return calendarUrl;
}

function formatTime24to12(time24) {
  let [hour, minute] = time24.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // convert 0 to 12 for midnight
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}