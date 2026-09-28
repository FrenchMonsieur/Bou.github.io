/* =====================================================================
   MENU VINYLE (desktop)
   ---------------------------------------------------------------------
   Le bouton vinyle ouvre et ferme le menu des pages.
   Le menu se ferme aussi :
     - avec la touche Échap,
     - en cliquant n'importe où en dehors du menu.
   ===================================================================== */

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
    // Classes CSS pour l'animation du bouton et l'affichage du menu.
    boutonMenu.classList.toggle("is-open", ouvrir);
    menuVinyle.classList.toggle("is-open", ouvrir);

    // Informations pour les lecteurs d'écran.
    boutonMenu.setAttribute("aria-expanded", String(ouvrir));

    if (ouvrir) {
        boutonMenu.setAttribute("aria-label", "Fermer le menu");
    } else {
        boutonMenu.setAttribute("aria-label", "Ouvrir le menu");
    }

    // Menu fermé = liens impossibles à atteindre au clavier.
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
