//utils.js

function generateMapsUrl(evt) {
  const address = encodeURIComponent(`${evt.address}, ${evt.city}, ${evt.state} ${evt.zip}`);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS 
    ? `http://maps.apple.com/?q=${address}`
    : `https://www.google.com/maps/search/?api=1&query=${address}`;
}


function generateCalendarUrl(event) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    // On iOS, create a Blob URL to open in Calendar app
    const icsContent = createICSFromEvent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return url; // iOS will open the .ics file
  } else {
    // Desktop / Android → Google Calendar URL
    function toUTCString(dateStr, timeStr) {
      const [month, day, year] = dateStr.split("/").map(Number);
      const [hour, minute] = timeStr.split(":").map(Number);
      const centralOffset = 6 * 60; // CST assumed
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


function formatTime24to12(time24) {
  let [hour, minute] = time24.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // convert 0 to 12 for midnight
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}