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
// ELEMENTS SLIDE
// ==========================
const slide1 = document.getElementById("slide1"); // glisse le disque
const slide2 = document.getElementById("slide2"); // vers la platine
const slide3 = document.getElementById("slide3"); // bouge le bras

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

                    // slide : vers la platine disparaît, bouge le bras apparaît
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