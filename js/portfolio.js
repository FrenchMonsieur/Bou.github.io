// ==========================
// PLATINE : uniquement en mobile (moins de 1024 px)
// ==========================
if (window.matchMedia("(max-width: 1023px)").matches) {

    // ==========================
    // PLUGINS GSAP
    // ==========================
    gsap.registerPlugin(Draggable, InertiaPlugin, SplitText, ScrollTrigger);

    // ==========================
    // ELEMENTS DOM
    // ==========================
    const pochette = document.getElementById('pochette');
    const cover = document.getElementById('cover');
    let cible = document.getElementById("cible");
    let launched = false;

    // ==========================
    // ELEMENTS SLIDE
    // ==========================
    const slide1 = document.getElementById("slide1");
    const slide2 = document.getElementById("slide2");
    const slide3 = document.getElementById("slide3");
    const slide4 = document.getElementById("slide4");

    // ==========================
    // AFFICHAGE SLIDE AU CHARGEMENT
    // ==========================
    gsap.to(slide1, { opacity: 1, duration: 1 });

    // ==========================
    // ANIMATION DISQUE (rotation infinie)
    // ==========================
    const spin = gsap.to("#disqueN0", {
        rotation: 360,
        duration: 3,
        repeat: -1,
        ease: "none"
    });

    spin.pause();

    // ==========================
    // INTERACTION POCHETTE (ouvrir / fermer)
    // ==========================
    pochette.addEventListener('click', function () {
        cover.classList.toggle('coverAlt');
        gsap.to(slide4, { opacity: 0, duration: 0.5 });
    });

    // ==========================
    // DRAG DU DISQUE
    // ==========================
    Draggable.create("#p-disqueN0", {
        bounds: document.getElementById("super-table"),
        inertia: false,

        onClick: function () {},

        onDragEnd: function () {

            const ciblesOK = Draggable.hitTest("#cible", "#cible2", "50%");
            const magnetok = Draggable.hitTest("#cible2", "#cible3", "50%");

            gsap.to(slide1, { opacity: 0, duration: 0.5 });
            gsap.to(slide2, { opacity: 1, duration: 0.5, delay: 0.5 });

            if (ciblesOK) {}

            if (magnetok) {

                let cible2 = document.getElementById("cible2");

                let rectCible = cible.getBoundingClientRect();
                let rectCible2 = cible2.getBoundingClientRect();

                const centerCibleX = rectCible.left + rectCible.width / 2;
                const centerCibleY = rectCible.top + rectCible.height / 2;

                const centerCible2X = rectCible2.left + rectCible2.width / 2;
                const centerCible2Y = rectCible2.top + rectCible2.height / 2;

                const deltaX = centerCibleX - centerCible2X;
                const deltaY = centerCibleY - centerCible2Y;

                gsap.to("#p-disqueN0", {
                    x: `+=${deltaX}`,
                    y: `+=${deltaY}`,
                    duration: 1,
                    ease: "power2.out",
                    onComplete: function () {
                        Draggable.get("#p-disqueN0").update();

                        gsap.to(slide2, { opacity: 0, duration: 0.5 });
                        gsap.to(slide3, { opacity: 1, duration: 0.5, delay: 0.5 });
                    }
                });

            } else {
                spin.pause();
            }
        }
    });

    // ==========================
    // DRAG DU BRAS (rotation)
    // ==========================
    Draggable.create('#p-bras', {
        type: "rotation",
        bounds: { minRotation: 0, maxRotation: 55 },
        inertia: false,
        zIndexBoost: true,

        onClick: function () {},

        onDragEnd: function () {

            const ciblesOK = Draggable.hitTest("#cible", "#cible2", "50%");
            const sync = Draggable.hitTest("#disqueN0", "#bras", "10%");

            // slide : bouge le bras disparaît dès que le bras est bougé
            gsap.to(slide3, { opacity: 0, duration: 0.5 });

            if (sync && ciblesOK) {

                launched = true;
                spin.resume();
                gsap.to(slide4, { opacity: 1, duration: 0.5, delay: 1 });

                SplitText.create(".text", {
                    type: "words",
                    autoSplit: true,
                    onSplit(self) {
                        return gsap.from(self.words, {
                            duration: 1,
                            y: -100,
                            autoAlpha: 0,
                            stagger: 0.1
                        });
                    }
                });

                gsap.to("#text", {
                    opacity: 1,
                    duration: 4
                });

            } else {

                spin.pause();

                gsap.to("#text", {
                    opacity: 0,
                    duration: 4
                });
            }
        }
    });

    // ==========================
    // LANCEMENT AUTOMATIQUE AU SCROLL
    // ==========================
    function trigger() {
        if (launched) return;
        launched = true;

        gsap.to([slide1, slide2, slide3, slide4], { opacity: 0, duration: 0.5 });

        const cible2 = document.getElementById("cible2");
        const rectCible = cible.getBoundingClientRect();
        const rectCible2 = cible2.getBoundingClientRect();

        const deltaX = (rectCible.left + rectCible.width / 2) - (rectCible2.left + rectCible2.width / 2);
        const deltaY = (rectCible.top + rectCible.height / 2) - (rectCible2.top + rectCible2.height / 2);

        gsap.to("#p-disqueN0", {
            x: `+=${deltaX}`,
            y: `+=${deltaY}`,
            duration: 1,
            ease: "power2.out",
            onComplete: function () {
                Draggable.get("#p-disqueN0").update();

                gsap.to("#p-bras", {
                    rotation: 55,
                    duration: 1,
                    ease: "power2.out",
                    onComplete: function () {
                        Draggable.get("#p-bras").update();
                        spin.resume();
                        gsap.to("#text", { opacity: 1, duration: 1.5 });
                    }
                });
            }
        });
    }

    ScrollTrigger.create({
        trigger: "#table",
        start: "bottom 80%",
        once: true,
        onEnter: trigger
    });}


// ==========================
// CARROUSEL : uniquement sur PC (1024 px et plus)
// ==========================
gsap.matchMedia().add("(min-width: 1024px)", initCarrousel);
function initCarrousel() {

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

    const gauche = -1;
    const centre = 0;
    const droite = 1;
    const cachee = null;

    const decalageLateral = 115;
    const opaciteLaterale = 0.35;
    const tailleLaterale = 0.92;

    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duree = mouvementReduit ? 0 : 0.55;

    let indexActif = 0;
    let animationEnCours = false;

    const boucler = gsap.utils.wrap(0, cartes.length);

    function positionDeLaCarte(indexCarte, indexCentre) {
        if (indexCarte === indexCentre) {
            return centre;
        }

        if (indexCarte === boucler(indexCentre - 1)) {
            return gauche;
        }

        if (indexCarte === boucler(indexCentre + 1)) {
            return droite;
        }

        return cachee;
    }

    function apparencePour(position) {
        if (position === centre) {
            return {
                xPercent: 0,
                autoAlpha: 1,
                scale: 1,
                zIndex: 3
            };
        }

        if (position === gauche || position === droite) {
            return {
                xPercent: position * decalageLateral,
                autoAlpha: opaciteLaterale,
                scale: tailleLaterale,
                zIndex: 2
            };
        }

        return {
            autoAlpha: 0,
            scale: tailleLaterale,
            zIndex: 1
        };
    }

    function activerSeulementSiCentre(carte, position) {
        carte.inert = position !== centre;
    }

    cartes.forEach(function (carte, indexCarte) {
        const position = positionDeLaCarte(indexCarte, indexActif);
        gsap.set(carte, apparencePour(position));
        activerSeulementSiCentre(carte, position);
    });

    function afficherLaCarte(indexDemande) {
        if (animationEnCours) {
            return;
        }
        const nouvelIndex = boucler(indexDemande);
        if (nouvelIndex === indexActif) {
            return;
        }

        animationEnCours = true;

        const animation = gsap.timeline({
            defaults: { duration: duree, ease: "power3.inOut" },
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

            const etaitCachee = anciennePosition === cachee;
            const seraCachee = nouvellePosition === cachee;

            const changeDeCote = !etaitCachee && !seraCachee &&
                Math.abs(nouvellePosition - anciennePosition) === 2;

            const apparait = etaitCachee && !seraCachee;

            if (changeDeCote) {
                animation.set(carte, { ...apparence, autoAlpha: 0 }, 0);
                animation.to(carte, { autoAlpha: apparence.autoAlpha }, mouvementReduit ? 0 : 0.2);
            } else if (apparait) {
                animation.set(carte, { ...apparence, autoAlpha: 0 }, 0);
                animation.to(carte, apparence, mouvementReduit ? 0 : 0.1);
            } else {

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

    return function nettoyer() {
        boutonSuivant.removeEventListener("click", carteSuivante);
        boutonPrecedent.removeEventListener("click", cartePrecedente);
        gsap.killTweensOf(cartes);

        cartes.forEach(function (carte) {
            carte.inert = false;
        });
    };
}
