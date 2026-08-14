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
const filterButtons = document.querySelectorAll(".recipe-filters button");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const selectedCategory = button.dataset.filter;

        recipeCards.forEach(card => {

            const cardCategory = card.dataset.category;

            if (selectedCategory === "all" || cardCategory === selectedCategory) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

});