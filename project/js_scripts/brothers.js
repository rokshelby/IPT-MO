document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".brothers-container");
    const brothersData = "data/brothers.json";
    fetch(brothersData)
    .then(res => res.json())
    .then(brothers => {
        brothers.forEach(brother => {
        const card = document.createElement("div");
        card.className = "brother-card";
        card.innerHTML = `
        <img src="${brother.image}" alt="Brother Name">
        <p>Name: ${brother.name}<p>
        <p>Position/Role: ${brother.position}<p>
        <p>Crossing Year: ${brother.crossing}<p>


        `;
        container.appendChild(card);
      });
    });

});

