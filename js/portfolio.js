/* =====================================================================
   ACCUEIL
     1. Platine mobile (écrans de moins de 1024 px)
     2. Carrousel des rubriques (écrans de 1024 px et plus)
   ===================================================================== */


// ---------------------------------------------------------------------
// 1. Platine mobile, avec les consignes de manipulation
// ---------------------------------------------------------------------

initPlatineMobile({
    wrapperId: "p-disqueN0",
    imageId: "disqueN0",
    slides: true
});


// ---------------------------------------------------------------------
// 2. Carrousel desktop
// ---------------------------------------------------------------------
// Trois cartes sont visibles en même temps :
//   - la carte active au centre (la seule cliquable),
//   - la précédente à gauche,
//   - la suivante à droite.
// Les autres cartes sont cachées. Les flèches font tourner le carrousel.

gsap.matchMedia().add("(min-width: 1024px)", initCarrousel);

function initCarrousel() {

    // -----------------------------------------------------------------
    // Éléments HTML
    // -----------------------------------------------------------------

    const carrousel = document.querySelector(".carousel-wrapper");
    if (carrousel === null) {
        return;
    }

    const cartes = gsap.utils.toArray(".carousel-card", carrousel);
    const boutonPrecedent = carrousel.querySelector(".carousel-arrow.prev");
    const boutonSuivant = carrousel.querySelector(".carousel-arrow.next");

    if (cartes.length < 2 || boutonPrecedent === null || boutonSuivant === null) {
        return;
    }


    // -----------------------------------------------------------------
    // Réglages
    // -----------------------------------------------------------------

    // Positions possibles d'une carte.
    const GAUCHE = -1;
    const CENTRE = 0;
    const DROITE = 1;
    const CACHEE = null;

    // Décalage des cartes latérales, en % de la largeur d'une carte.
    // 115 % laisse environ 5 % d'espace entre deux cartes.
    const DECALAGE_LATERAL = 115;
    const OPACITE_LATERALE = 0.35;
    const TAILLE_LATERALE = 0.92;

    // Si l'utilisateur a demandé moins d'animations dans son système,
    // les changements de carte sont instantanés.
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DUREE = mouvementReduit ? 0 : 0.55;


    // -----------------------------------------------------------------
    // État
    // -----------------------------------------------------------------

    let indexActif = 0;
    let animationEnCours = false;

    // Transforme n'importe quel nombre en index valide :
    // après la dernière carte on revient à la première, et inversement.
    const boucler = gsap.utils.wrap(0, cartes.length);


    // -----------------------------------------------------------------
    // Calcul des positions
    // -----------------------------------------------------------------

    // Où doit se trouver la carte n° indexCarte si la carte n° indexCentre
    // est au centre ?
    function positionDeLaCarte(indexCarte, indexCentre) {
        if (indexCarte === indexCentre) {
            return CENTRE;
        }

        if (indexCarte === boucler(indexCentre - 1)) {
            return GAUCHE;
        }

        if (indexCarte === boucler(indexCentre + 1)) {
            return DROITE;
        }

        return CACHEE;
    }

    // Apparence (position, opacité, taille, profondeur) d'une carte
    // selon sa position.
    function apparencePour(position) {
        if (position === CENTRE) {
            return {
                xPercent: 0,
                autoAlpha: 1,
                scale: 1,
                zIndex: 3
            };
        }

        if (position === GAUCHE || position === DROITE) {
            return {
                xPercent: position * DECALAGE_LATERAL,
                autoAlpha: OPACITE_LATERALE,
                scale: TAILLE_LATERALE,
                zIndex: 2
            };
        }

        // Carte cachée : on ne change pas xPercent, elle disparaît sur place.
        return {
            autoAlpha: 0,
            scale: TAILLE_LATERALE,
            zIndex: 1
        };
    }

    // Seule la carte du centre peut être cliquée ou atteinte au clavier.
    // « inert » désactive aussi la carte pour les lecteurs d'écran.
    function activerSeulementSiCentre(carte, position) {
        carte.inert = position !== CENTRE;
    }


    // -----------------------------------------------------------------
    // Placement de départ
    // -----------------------------------------------------------------

    cartes.forEach(function (carte, indexCarte) {
        const position = positionDeLaCarte(indexCarte, indexActif);

        gsap.set(carte, apparencePour(position));
        activerSeulementSiCentre(carte, position);
    });


    // -----------------------------------------------------------------
    // Changement de carte
    // -----------------------------------------------------------------

    function afficherLaCarte(indexDemande) {
        // On attend la fin de l'animation précédente.
        if (animationEnCours) {
            return;
        }

        const nouvelIndex = boucler(indexDemande);
        if (nouvelIndex === indexActif) {
            return;
        }

        animationEnCours = true;

        const animation = gsap.timeline({
            defaults: { duration: DUREE, ease: "power3.inOut" },
            onComplete: function () {
                indexActif = nouvelIndex;
                animationEnCours = false;
            }
        });

        cartes.forEach(function (carte, indexCarte) {
            const anciennePosition = positionDeLaCarte(indexCarte, indexActif);
            const nouvellePosition = positionDeLaCarte(indexCarte, nouvelIndex);
            const apparence = apparencePour(nouvellePosition);

            activerSeulementSiCentre(carte, nouvellePosition);

            const etaitCachee = anciennePosition === CACHEE;
            const seraCachee = nouvellePosition === CACHEE;

            // Cas 1 : la carte passe directement de gauche à droite (ou
            // l'inverse). Ça n'arrive qu'avec 3 cartes. On la déplace invisible
            // puis on la fait réapparaître, pour qu'elle ne traverse pas
            // la carte du centre.
            const changeDeCote = !etaitCachee && !seraCachee &&
                Math.abs(nouvellePosition - anciennePosition) === 2;

            // Cas 2 : la carte était cachée et devient visible. On la place
            // directement à sa nouvelle position, invisible, puis elle apparaît.
            const apparait = etaitCachee && !seraCachee;

            if (changeDeCote) {
                animation.set(carte, { ...apparence, autoAlpha: 0 }, 0);
                animation.to(carte, { autoAlpha: apparence.autoAlpha }, mouvementReduit ? 0 : 0.2);
            } else if (apparait) {
                animation.set(carte, { ...apparence, autoAlpha: 0 }, 0);
                animation.to(carte, apparence, mouvementReduit ? 0 : 0.1);
            } else {
                // Cas normal : la carte glisse vers sa nouvelle position.
                animation.to(carte, apparence, 0);
            }
        });
    }

    function carteSuivante() {
        afficherLaCarte(indexActif + 1);
    }

    function cartePrecedente() {
        afficherLaCarte(indexActif - 1);
    }

    boutonSuivant.addEventListener("click", carteSuivante);
    boutonPrecedent.addEventListener("click", cartePrecedente);


    // -----------------------------------------------------------------
    // Nettoyage quand on repasse en mobile
    // -----------------------------------------------------------------

    return function nettoyer() {
        boutonSuivant.removeEventListener("click", carteSuivante);
        boutonPrecedent.removeEventListener("click", cartePrecedente);
        gsap.killTweensOf(cartes);

        cartes.forEach(function (carte) {
            carte.inert = false;
        });
    };
}
