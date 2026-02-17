let pochette = document.getElementById('pochette')
console.log(pochette)

let cover = document.getElementById('cover')
console.log(cover)

let bras = document.getElementById('bras')
console.log(bras)

gsap.registerPlugin(Draggable, InertiaPlugin);

pochette.addEventListener('click', function () {
    cover.classList.toggle('coverAlt');

    // let coverAlt = document.querySelector('.coverAlt')

    // coverAlt.addEventListener('click', function () {
    //     coverAlt.remove('coverAlt')
    // });

});

Draggable.create('#p-disque_skill', {
    bounds: document.getElementById('bois'),
    inertia: true,
    onClick: function () {
    },
    onDragEnd: function () {
        if (this.hitTest("#cible", "#cible2", "50%")) {
            gsap.to(this.cible, {
                x: gsap.getProperty("#cible", "x"),
                y: gsap.getProperty("#cible", "y"),
                duration: 0.3,
            });
            gsap.to(this.cible2, {
                x: gsap.getProperty("#cible2", "x"),
                y: gsap.getProperty("#cible2", "y"),
                duration: 0.3,
            });
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
        if (this.hitTest("#disque_skill", "bras", "100%")) {
            gsap.to(this.cible, {
                x: gsap.getProperty("#disque_skill", "x"),
                y: gsap.getProperty("#disque_skill", "y"),
                duration: 0.3,
            });
            gsap.to(this.cible, {
                x: gsap.getProperty("#bras", "x"),
                y: gsap.getProperty("#bras", "y"),
                duration: 0.3,
            });
            this.disable();
            gsap.to("#disque_skill", {
                rotation: 360,
                repeat: -1,
                ease: "none"
            });
        }
    }
});
