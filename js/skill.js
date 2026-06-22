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

        const ciblesOK = Draggable.hitTest("#cible", "#cible2", "50%");
        const magnetok = Draggable.hitTest("#cible2", "#cible3", "50%");

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

        const ciblesOK = Draggable.hitTest("#cible", "#cible2", "50%");
        const sync = Draggable.hitTest("#disque_skill", "#bras", "10%");

        if (sync && ciblesOK) {

            launched = true;
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

// ==========================
// LANCEMENT AUTOMATIQUE AU SCROLL
// ==========================
function trigger() {
    if (launched) return;
    launched = true;

    const cible2 = document.getElementById("cible2");
    const rectCible = cible.getBoundingClientRect();
    const rectCible2 = cible2.getBoundingClientRect();

    const deltaX = (rectCible.left + rectCible.width / 2) - (rectCible2.left + rectCible2.width / 2);
    const deltaY = (rectCible.top + rectCible.height / 2) - (rectCible2.top + rectCible2.height / 2);

    gsap.to("#p-disque_skill", {
        x: `+=${deltaX}`,
        y: `+=${deltaY}`,
        duration: 1,
        ease: "power2.out",
        onComplete: function () {
            Draggable.get("#p-disque_skill").update();

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
});