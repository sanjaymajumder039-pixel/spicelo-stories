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

if (recipeSearch) {

    recipeSearch.addEventListener("input", () => {

        const searchTerm = recipeSearch.value.toLowerCase().trim();

        recipeCards.forEach(card => {

            const recipeName =
                card.querySelector("h3").textContent.toLowerCase();

            if (recipeName.includes(searchTerm)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

}
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
/* =========================================
   SPICELO STORIES — SUPABASE
   JHAL MURI LIKE & COMMENTS
========================================= */

const SUPABASE_URL = "https://uqqhkzhuexememvzdslw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EEoU5ndnSgZ7ADOXBg5Qxg_1NoT86r5";

let supabaseClient = null;

if (window.supabase) {

    const { createClient } = window.supabase;

    supabaseClient = createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

}


/* =========================================
   RUN ONLY ON RECIPE ENGAGEMENT PAGES
========================================= */

const likeButton = document.getElementById("likeButton");
const likeCount = document.getElementById("likeCount");
const commentForm = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");
const commentMessage = document.getElementById("commentMessage");

if (
    likeButton &&
    likeCount &&
    commentForm &&
    commentsList
) {

    const recipeSlug = document.body.dataset.recipeSlug;

    let visitorId = localStorage.getItem("spiceloVisitorId");

    if (!visitorId) {
        visitorId =
            crypto.randomUUID
                ? crypto.randomUUID()
                : "visitor-" + Date.now() + "-" + Math.random();

        localStorage.setItem("spiceloVisitorId", visitorId);
    }


    /* =========================================
       LOAD LIKE COUNT
    ========================================= */

    async function loadLikeCount() {

        const { count, error } = await supabaseClient
            .from("likes")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("recipe_slug", recipeSlug);

        if (error) {
            console.error("Like count error:", error);
            return;
        }

        likeCount.textContent = `${count || 0} Likes`;
    }


    /* =========================================
       LIKE RECIPE
    ========================================= */

    likeButton.addEventListener("click", async () => {

        likeButton.disabled = true;

        const { error } = await supabaseClient
            .from("likes")
            .insert({
                recipe_slug: recipeSlug,
                visitor_id: visitorId
            });

        if (error) {

            if (error.code === "23505") {
                likeButton.textContent = "❤️ Already Liked";
            } else {
                console.error("Like error:", error);
                likeButton.textContent = "Try Again";
                likeButton.disabled = false;
                return;
            }

        } else {

            likeButton.textContent = "❤️ Liked";

        }

        await loadLikeCount();
    });


    /* =========================================
       LOAD COMMENTS
    ========================================= */

    async function loadComments() {

        const { data, error } = await supabaseClient
            .from("comments")
            .select("id, name, comment, created_at")
            .eq("recipe_slug", recipeSlug)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Comments loading error:", error);
            return;
        }

        commentsList.innerHTML = "";

        if (!data || data.length === 0) {

            commentsList.innerHTML =
                "<p>No comments yet. Be the first to comment!</p>";

            return;
        }


        data.forEach(item => {

            const commentItem = document.createElement("div");

            commentItem.className = "comment-item";

            const name = document.createElement("strong");
            name.textContent = item.name;

            const text = document.createElement("p");
            text.textContent = item.comment;

            commentItem.appendChild(name);
            commentItem.appendChild(text);

            commentsList.appendChild(commentItem);
        });
    }


    /* =========================================
       POST COMMENT
    ========================================= */

    commentForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nameInput =
            document.getElementById("commentName");

        const textInput =
            document.getElementById("commentText");

        const name = nameInput.value.trim();
        const comment = textInput.value.trim();


        if (!name || !comment) {
            return;
        }


        const submitButton =
            commentForm.querySelector("button[type='submit']");

        submitButton.disabled = true;

        commentMessage.textContent = "Posting comment...";


        const { error } = await supabaseClient
            .from("comments")
            .insert({
                recipe_slug: recipeSlug,
                name: name,
                comment: comment
            });


        if (error) {

            console.error("Comment error:", error);

            commentMessage.textContent =
                "Sorry, comment could not be posted.";

            submitButton.disabled = false;

            return;
        }


        commentForm.reset();

        commentMessage.textContent =
            "Comment posted successfully!";

        submitButton.disabled = false;

        await loadComments();
    });


    /* =========================================
       INITIAL LOAD
    ========================================= */

    loadLikeCount();
    loadComments();

}
/* =========================================
   SpiceLo Stories — Dynamic Time Atmosphere
========================================= */

function updateTimeGreeting() {

    const greetingTitle = document.getElementById("greetingTitle");
    const greetingMessage = document.getElementById("greetingMessage");
    const atmosphere = document.getElementById("timeAtmosphere");

    if (!greetingTitle || !greetingMessage || !atmosphere) {
        return;
    }

    const hour = new Date().getHours();

    /* Clear previous atmosphere */
    atmosphere.innerHTML = "";

    /* 🌅 MORNING */
    if (hour >= 5 && hour < 12) {

        greetingTitle.textContent = "🌅 Good Morning! 🐦";
        greetingMessage.textContent =
            "A fresh day, a fresh story.";

        atmosphere.className = "time-atmosphere morning";

        atmosphere.innerHTML = `
            <span class="bird bird-one">🐦</span>
            <span class="bird bird-two">🐦</span>
            <span class="sun">🌅</span>
            <span class="butterfly butterfly-one">🦋</span>
        `;
    }

    /* ☀️ AFTERNOON */
    else if (hour >= 12 && hour < 17) {

        greetingTitle.textContent = "☀️ Good Afternoon! 🦋";
        greetingMessage.textContent =
            "What are we cooking today? 🍳";

        atmosphere.className = "time-atmosphere afternoon";

        atmosphere.innerHTML = `
            <span class="sun">☀️</span>
            <span class="butterfly butterfly-one">🦋</span>
            <span class="butterfly butterfly-two">🦋</span>
            <span class="leaf">🌿</span>
        `;
    }

    /* 🌆 EVENING */
    else if (hour >= 17 && hour < 21) {

        greetingTitle.textContent = "🌆 Good Evening! 🐦";
        greetingMessage.textContent =
            "Slow down, relax, and enjoy a delicious story.";

        atmosphere.className = "time-atmosphere evening";

        atmosphere.innerHTML = `
            <span class="sunset">🌆</span>
            <span class="bird bird-one">🐦</span>
            <span class="bird bird-two">🐦</span>
            <span class="leaf">🍃</span>
        `;
    }

    /* 🌙 NIGHT */
    else {

        greetingTitle.textContent = "🌙 Good Night! ✨";
        greetingMessage.textContent =
            "Cozy moments, delicious stories.";

        atmosphere.className = "time-atmosphere night";

        atmosphere.innerHTML = `
            <span class="moon">🌙</span>
            <span class="star star-one">✨</span>
            <span class="star star-two">⭐</span>
            <span class="star star-three">✨</span>
        `;
    }
}

updateTimeGreeting();