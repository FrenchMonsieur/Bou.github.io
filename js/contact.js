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

Draggable.create('#p-disque_contact', {
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
        const ciblesOK = Draggable.hitTest("#cible", "#cible2", "90%");
        if (this.hitTest("#disque_contact", "bras", "100%") && ciblesOK) {
            this.disable();
            gsap.to("#disque_contact", {
                rotation: 360,
                repeat: -1,
                duration: 4.5,
                ease: "none"
            });
            this.disable();
        }
    }
});