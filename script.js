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
/* =========================================
   SPICELO STORIES — RECIPE DISCOVERY
   Search + Category Filter
========================================= */

const recipeSearch = document.getElementById("recipeSearch");
const recipeCards = document.querySelectorAll(".food-card");
const filterButtons = document.querySelectorAll(".recipe-filters button");

let selectedCategory = "all";


function filterRecipes() {

    const searchTerm = recipeSearch
        ? recipeSearch.value.toLowerCase().trim()
        : "";

    let visibleCount = 0;

    recipeCards.forEach(card => {

        const recipeName =
            card.querySelector("h3")?.textContent.toLowerCase() || "";

        const recipeDescription =
            card.querySelector("p")?.textContent.toLowerCase() || "";

        const cardCategory =
            card.dataset.category || "";

        const matchesSearch =
            recipeName.includes(searchTerm) ||
            recipeDescription.includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            cardCategory === selectedCategory;

        if (matchesSearch && matchesCategory) {

            card.style.display = "";
            visibleCount++;

        } else {

            card.style.display = "none";

        }

    });


    updateRecipeResultMessage(visibleCount);
}


function updateRecipeResultMessage(count) {

    let resultMessage =
        document.getElementById("recipeResultMessage");

    if (!resultMessage) {

        resultMessage = document.createElement("p");

        resultMessage.id = "recipeResultMessage";

        resultMessage.setAttribute(
            "aria-live",
            "polite"
        );

        const foodGrid =
            document.querySelector(".food-grid");

        if (foodGrid) {
            foodGrid.parentNode.insertBefore(
                resultMessage,
                foodGrid
            );
        }

    }

    const hasSearch =
        recipeSearch &&
        recipeSearch.value.trim() !== "";

    const hasFilter =
        selectedCategory !== "all";


    if (!hasSearch && !hasFilter) {

        resultMessage.textContent = "";

        return;
    }


    if (count === 0) {

        resultMessage.textContent =
            "🍽️ No recipes found. Try another search or category.";

    } else if (count === 1) {

        resultMessage.textContent =
            "🍽️ 1 recipe found";

    } else {

        resultMessage.textContent =
            `🍽️ ${count} recipes found`;

    }

}


/* ===== Search ===== */

if (recipeSearch) {

    recipeSearch.addEventListener(
        "input",
        filterRecipes
    );

}


/* ===== Category Filters ===== */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedCategory =
            button.dataset.filter || "all";


        /* Active button */

        filterButtons.forEach(item => {

            item.classList.remove("active");

        });

        button.classList.add("active");


        filterRecipes();

    });

});


/* ===== Initial State ===== */

filterButtons.forEach(button => {

    if (button.dataset.filter === "all") {

        button.classList.add("active");

    }

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

        likeCount.textContent = `${count || 0} ${count === 1 ? "Like" : "Likes"}`;
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

                atmosphere.innerHTML = ``;
            
    }

    /* ☀️ AFTERNOON */
    else if (hour >= 12 && hour < 17) {

        greetingTitle.textContent = "☀️ Good Afternoon! 🦋";
        greetingMessage.textContent =
            "What are we cooking today? 🍳";

        atmosphere.className = "time-atmosphere afternoon";

        atmosphere.innerHTML = `
            
            
           
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
/* =========================================
   SPICELO STORIES — DARK MODE
========================================= */

const darkModeButton =
    document.getElementById("darkModeButton");


if (darkModeButton) {

    /* Load saved theme */

    if (localStorage.getItem("spiceloTheme") === "dark") {

        document.body.classList.add("dark-mode");

        darkModeButton.textContent = "☀️ Light Mode";

    }


    /* Toggle theme */

    darkModeButton.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");


        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem(
                "spiceloTheme",
                "dark"
            );

            darkModeButton.textContent =
                "☀️ Light Mode";

        } else {

            localStorage.setItem(
                "spiceloTheme",
                "light"
            );

            darkModeButton.textContent =
                "🌙 Dark Mode";

        }

    });

}
/* =========================
   SHARE RECIPE BUTTONS
========================= */

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);

    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        "_blank"
    );
}

function shareOnPinterest() {
    const url = encodeURIComponent(window.location.href);

    window.open(
        `https://pinterest.com/pin/create/button/?url=${url}`,
        "_blank"
    );
}

function copyRecipeLink() {
    const link = window.location.href;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(link)
            .then(() => {
                showCopiedMessage();
            })
            .catch(() => {
                fallbackCopy(link);
            });
    } else {
        fallbackCopy(link);
    }
}


function fallbackCopy(link) {
    const textArea = document.createElement("textarea");

    textArea.value = link;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    document.execCommand("copy");

    document.body.removeChild(textArea);

    showCopiedMessage();
}


function showCopiedMessage() {
    const button = document.querySelector(
        'button[onclick="copyRecipeLink()"]'
    );

    if (!button) return;

    const originalText = button.innerHTML;

    button.innerHTML = "✅ Link Copied!";

    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}
/* =========================================
   SPICELO STORIES — AUTOMATIC LATEST RECIPES
   Reads latest recipes from RSS.xml
========================================= */

async function loadLatestRecipes() {

    const latestGrid =
        document.getElementById("latestRecipesGrid");

    if (!latestGrid) {
        return;
    }

    try {

        const response =
            await fetch("rss.xml");

        if (!response.ok) {
            throw new Error("RSS feed could not be loaded.");
        }

        const rssText =
            await response.text();

        const parser =
            new DOMParser();

        const xml =
            parser.parseFromString(
                rssText,
                "application/xml"
            );

        const items =
            Array.from(
                xml.querySelectorAll("item")
            );

        if (items.length === 0) {

            latestGrid.innerHTML =
                "<p>No latest recipes available.</p>";

            return;
        }

        /* Latest 3 recipes */

        const latestItems = items.slice(0, 3);

        latestGrid.innerHTML = "";

        latestItems.forEach(item => {

            const title =
                item.querySelector("title")?.textContent
                || "Recipe";

            const description =
                item.querySelector("description")?.textContent
                || "";

            const link =
                item.querySelector("link")?.textContent
                || "#";

            const image =
                item.querySelector("media\\:content")?.getAttribute("url")
                || item.querySelector("enclosure")?.getAttribute("url")
                || "";

            const card =
                document.createElement("article");

            card.className = "latest-card";

            card.innerHTML = `
                <img
                    src="${image}"
                    alt="${title}"
                >

                <div class="latest-card-content">

                    <span class="latest-category">
                        Latest Recipe
                    </span>

                    <h3>${title}</h3>

                    <p>${description}</p>

                    <button
                        onclick="window.location.href='${link}'">
                        View Recipe →
                    </button>

                </div>
            `;

            latestGrid.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Latest Recipes Error:",
            error
        );

        latestGrid.innerHTML =
            "<p>Latest recipes could not be loaded.</p>";

    }
}


/* Load Latest Recipes */

loadLatestRecipes();
/* =========================================
   SPICELO RECIPE ASSISTANT — CHAT TOGGLE
========================================= */

const assistantToggle =
    document.getElementById("assistantToggle");

const assistantChat =
    document.getElementById("assistantChat");

const assistantClose =
    document.getElementById("assistantClose");


if (assistantToggle && assistantChat) {

    assistantToggle.addEventListener("click", function () {

        assistantChat.style.display = "block";

        assistantChat.setAttribute(
            "aria-hidden",
            "false"
        );

    });

}


if (assistantClose && assistantChat) {

    assistantClose.addEventListener("click", function () {

        assistantChat.style.display = "none";

        assistantChat.setAttribute(
            "aria-hidden",
            "true"
        );

    });

}