const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {

    reveals.forEach(section => {

        const top = section.getBoundingClientRect().top;

        const windowHeight = window.innerHeight;

        if(top < windowHeight - 100){

            section.classList.add("active");

        }

    });

});
const recipeSearch = document.getElementById("recipeSearch");
const recipeCards = document.querySelectorAll(".food-card");

recipeSearch.addEventListener("input", () => {

    const searchTerm = recipeSearch.value.toLowerCase().trim();

    recipeCards.forEach(card => {

        const recipeName = card.querySelector("h3").textContent.toLowerCase();

        if (recipeName.includes(searchTerm)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }

    });

});