// ==========================
// PLUGINS GSAP
// ==========================
gsap.registerPlugin(Draggable, InertiaPlugin, SplitText);

// ==========================
// ELEMENTS DOM
// ==========================
const pochette = document.getElementById('pochette');
const cover = document.getElementById('cover');
let cible = document.getElementById("cible");

// ==========================
// ANIMATION DISQUE (rotation infinie)
// ==========================
const spin = gsap.to("#disque_skill", {
    rotation: 360,       // tourne sur 360°
    duration: 3,         // en 3 secondes
    repeat: -1,          // boucle infinie
    ease: "none"         // vitesse constante
});

spin.pause(); // démarre en pause

// ==========================
// INTERACTION POCHETTE (ouvrir / fermer)
// ==========================
pochette.addEventListener('click', function () {
    cover.classList.toggle('coverAlt'); // change le style
});

// ==========================
// DRAG DU DISQUE
// ==========================
Draggable.create("#p-disque_skill", {
    bounds: document.getElementById("bois"), // limite dans le bois
    inertia: false,

    onClick: function () {
        // rien ici pour l’instant
    },

    onDragEnd: function () {

        // vérifie superposition cible/cible4
        const ciblesOK = Draggable.hitTest("#cible", "#cible4", "30%");

        // vérifie si on doit aimanter
        const magnetok = Draggable.hitTest("#cible4", "#cible3", "50%");

        if (ciblesOK) {
            // rien pour l’instant
        }

        if (magnetok) {

            let disque = document.getElementById("disque_skill");

            // positions des éléments
            let rectCible = cible.getBoundingClientRect();
            let rectDisque = disque.getBoundingClientRect();

            // centre cible
            const centerCibleX = rectCible.left + rectCible.width / 2;
            const centerCibleY = rectCible.top + rectCible.height / 2;

            // centre disque
            const centerDisqueX = rectDisque.left + rectDisque.width / 2;
            const centerDisqueY = rectDisque.top + rectDisque.height / 2;

            // distance à parcourir
            const deltaX = centerCibleX - centerDisqueX;
            const deltaY = centerCibleY - centerDisqueY;

            // animation vers la cible (effet aimant)
            gsap.to("#disque_skill", {
                x: `+=${deltaX}`,   // déplacement relatif X
                y: `+=${deltaY}`,   // déplacement relatif Y
                duration: 1,
                ease: "power2.out"
            });
        }
    }
});

// ==========================
// DRAG DU BRAS (rotation)
// ==========================
Draggable.create('#p-bras', {
    type: "rotation",
    bounds: { minRotation: 0, maxRotation: 55 }, // limite angle
    inertia: false,
    zIndexBoost: true,

    onClick: function () {
        // rien ici
    },

    onDragEnd: function () {

        // vérifie si disque bien placé
        const ciblesOK = Draggable.hitTest("#cible", "#cible4", "30%");

        const sync = Draggable.hitTest("#disque_skill", "#bras", "10%");

        // si bras touche disque + disque bien placé
        if (sync && ciblesOK) {

            spin.resume(); // lance la rotation

            // animation du texte mot par mot
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

            // fade in du texte
            gsap.to("#text", {
                opacity: 1,
                duration: 4
            });

        } else {

            spin.pause(); // stop rotation

            // fade out du texte
            gsap.to("#text", {
                opacity: 0,
                duration: 4
            });
        }
    }
});