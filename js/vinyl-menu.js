const boutonMenu = document.getElementById("vinyl-btn");
const menuVinyle = document.getElementById("vinyl-menu");

if (boutonMenu !== null && menuVinyle !== null) {
    boutonMenu.addEventListener("click", ouvrirOuFermerMenu);
    document.addEventListener("keydown", fermerMenuAvecEchap);
    document.addEventListener("click", fermerMenuSiClicAilleurs);
}

function menuEstOuvert() {
    return boutonMenu.getAttribute("aria-expanded") === "true";
}

function changerEtatMenu(ouvrir) {

    boutonMenu.classList.toggle("is-open", ouvrir);
    menuVinyle.classList.toggle("is-open", ouvrir);

    boutonMenu.setAttribute("aria-expanded", String(ouvrir));

    if (ouvrir) {
        boutonMenu.setAttribute("aria-label", "Fermer le menu");
    } else {
        boutonMenu.setAttribute("aria-label", "Ouvrir le menu");
    }

    menuVinyle.inert = !ouvrir;
}

function ouvrirOuFermerMenu() {
    changerEtatMenu(!menuEstOuvert());
}
function fermerMenuAvecEchap(evenement) {
    if (evenement.key === "Escape" && menuEstOuvert()) {
        changerEtatMenu(false);
        boutonMenu.focus();
    }
}

function fermerMenuSiClicAilleurs(evenement) {
    const clicSurLeBouton = boutonMenu.contains(evenement.target);
    const clicDansLeMenu = menuVinyle.contains(evenement.target);

    if (!clicSurLeBouton && !clicDansLeMenu) {
        changerEtatMenu(false);
    }
}
