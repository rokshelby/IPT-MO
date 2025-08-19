//brothers.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".brothers-container");
  const presidentContainer = document.querySelector(".president-container");
  const vicePresidentContainer = document.querySelector(".vice-president-container");
  const secretaryContainer = document.querySelector(".secretary-container");
  const treasurerContainer = document.querySelector(".treasurer-container");
  const sergeantAtArmsContainer = document.querySelector(".sergeant-at-arms-container");
  const brothersData = "data/brothers.json";


  fetch(brothersData)
    .then(res => res.json())
    .then(brothers => {
      brothers.forEach(brother => {
          if(brother.position === "president"){
            presidentContainer.append(returnCard(brother));
          }else if(brother.position === "vice-president"){
            vicePresidentContainer.append(returnCard(brother));
          }else if(brother.position === "secretary"){
            secretaryContainer.append(returnCard(brother));
          }else if(brother.position === "sergeant-at-arms"){
            sergeantAtArmsContainer.append(returnCard(brother));
          }else if(brother.position === "treasurer"){
            treasurerContainer.append(returnCard(brother));
          }


          container.appendChild(returnCard(brother));
          
      });
    })
    .catch(err => console.error("Failed to load brothers.json:", err));
});

function returnCard(brother){

  // mark execs with a special class
   const execPositions = ["president", "vice-president", "secretary", "treasurer", "sergeant-at-arms"];
   let x = execPositions.includes(brother.position.toLowerCase());

   
   


   const card = document.createElement("div");
        card.className = "brother-card";
        card.innerHTML = `
        <img src="${brother.image}" alt="${brother.name}">
        <p><strong>Name:</Strong> ${brother.name}</p>
          <p><strong>Position/Role:</strong> ${brother.position}</p>
          <p><strong>Joined:</strong> ${brother.crossing}</p>
          <p><strong>Path:</strong>${brother["university/professional"]}</p>
          `;
          if(x){
            card.classList.add("exec-card");
            card.innerHTML += `<div class="exec-badge">Exec Board</div>`;
       
          }
        return card;
}