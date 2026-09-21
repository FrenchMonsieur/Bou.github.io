// Menu vinyle uniquement : ne touche ni aux animations GSAP ni à la platine.
const vinylButton = document.querySelector("#vinyl-btn");
const vinylMenu = document.querySelector("#vinyl-menu");

if (vinylButton && vinylMenu) {
    const setMenuOpen = (open) => {
        vinylButton.classList.toggle("is-open", open);
        vinylMenu.classList.toggle("is-open", open);
        vinylButton.setAttribute("aria-expanded", String(open));
        vinylButton.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
        vinylMenu.inert = !open;
    };

    vinylButton.addEventListener("click", () => {
        setMenuOpen(vinylButton.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && vinylButton.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            vinylButton.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (!vinylButton.contains(event.target) && !vinylMenu.contains(event.target)) {
            setMenuOpen(false);
        }
    });
}

// Le titre « Portfolio » du header renvoie à l'accueil sur toutes les pages.
const portfolioTitle = document.querySelector(".top-g h1");

if (portfolioTitle) {
    portfolioTitle.style.cursor = "pointer";
    portfolioTitle.setAttribute("role", "link");
    portfolioTitle.setAttribute("tabindex", "0");
    portfolioTitle.setAttribute("aria-label", "Retour à l’accueil");

    const retourAccueil = () => {
        window.location.href = "index.html";
    };

    portfolioTitle.addEventListener("click", retourAccueil);
    portfolioTitle.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            retourAccueil();
        }
    });
}
