//utils.js

function generateMapsUrl(evt) {
  const address = encodeURIComponent(`${evt.address}, ${evt.city}, ${evt.state} ${evt.zip}`);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS 
    ? `http://maps.apple.com/?q=${address}`
    : `https://www.google.com/maps/search/?api=1&query=${address}`;
}





function formatTime24to12(time24) {
  let [hour, minute] = time24.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // convert 0 to 12 for midnight
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}