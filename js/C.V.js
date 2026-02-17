let pochette = document.getElementById('pochette')
console.log(pochette)

let cover = document.getElementById('cover')
console.log(cover)

let bras = document.getElementById('bras')
console.log(bras)

gsap.registerPlugin(Draggable, InertiaPlugin);

pochette.addEventListener('click', function () {
    cover.classList.toggle('coverAlt');
});

Draggable.create('#p-disque_cv', {
    bounds: document.getElementById('bois'),
    inertia: true,
    onClick: function () {
    },
    onDragEnd: function () {
        const ciblesOK = Draggable.hitTest("#cible", "#cible2", "90%");
        if (ciblesOK) {
            this.disable();
        }
    }
});

Draggable.create('#p-bras', {
    bounds: document.getElementById('bras'),
    type: "rotation",
    bounds: { minRotation: 0, maxRotation: 55 },
    inertia: false,
    zIndexBoost: true,
    onClick: function () {
        console.log('clicked');
    },
    onDragEnd: function () {
        if (this.hitTest("#disque_cv", "bras", "100%")) {
            this.disable();
            // gsap.to("#bras", {
            //     rotation: 38,
            //     duration:2.5
            // });
            gsap.to("#disque_cv", {
                rotation: 360,
                repeat: -1,
                duration: 4.5,
                ease: "none",
                // delay:2.5
            });
        }
    }
});