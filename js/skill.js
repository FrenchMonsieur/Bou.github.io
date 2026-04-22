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
});

// ==========================
// DRAG DU DISQUE
// ==========================
Draggable.create("#p-disque_skill", {
    bounds: document.getElementById("super-table"),
    inertia: false,

    onClick: function () {},

    onDragEnd: function () {

        // skill utilise #cible4 (et non #cible2) avec un seuil à 30%
        const ciblesOK = Draggable.hitTest("#cible", "#cible4", "30%");
        const magnetok = Draggable.hitTest("#cible4", "#cible3", "50%");

        if (ciblesOK) {}

        if (magnetok) {

            let cible4 = document.getElementById("cible4");

            let rectCible = cible.getBoundingClientRect();
            let rectCible4 = cible4.getBoundingClientRect();

            const centerCibleX = rectCible.left + rectCible.width / 2;
            const centerCibleY = rectCible.top + rectCible.height / 2;

            const centerCible4X = rectCible4.left + rectCible4.width / 2;
            const centerCible4Y = rectCible4.top + rectCible4.height / 2;

            const deltaX = centerCibleX - centerCible4X;
            const deltaY = centerCibleY - centerCible4Y;

            gsap.to("#p-disque_skill", {
                x: `+=${deltaX}`,
                y: `+=${deltaY}`,
                duration: 1,
                ease: "power2.out",
                onComplete: function () {
                    Draggable.get("#p-disque_skill").update();
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

        // skill utilise #cible4 avec un seuil à 30%
        const ciblesOK = Draggable.hitTest("#cible", "#cible4", "30%");
        const sync = Draggable.hitTest("#disque_skill", "#bras", "10%");

        if (sync && ciblesOK) {

            spin.resume();

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
