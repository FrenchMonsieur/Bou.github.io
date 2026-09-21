/* Logique commune à la platine de la V1 : exécutée uniquement sous 1024 px.
   Les fichiers propres à chaque page fournissent le disque et les options. */
(() => {
    "use strict";

    window.initPlatineMobile = function initPlatineMobile(options) {
        const { wrapperId, imageId, slides = false, splitText = true,
            scrollRevealDuration = 1.5 } = options;

        const wrapper = document.getElementById(wrapperId);
        const image = document.getElementById(imageId);
        const arm = document.getElementById("p-bras");
        const armImage = document.getElementById("bras");
        const plateau = document.getElementById("super-table");
        const table = document.getElementById("table");
        const cible = document.getElementById("cible");
        const cible2 = document.getElementById("cible2");
        const cible3 = document.getElementById("cible3");
        const pochette = document.getElementById("pochette");
        const cover = document.getElementById("cover");
        const text = Array.from(plateau?.querySelectorAll(".text") || []);

        if (!wrapper || !image || !arm || !armImage || !plateau || !table ||
            !cible || !cible2 || !cible3 || !pochette || !cover || !text.length) {
            console.warn("Platine : éléments HTML manquants sur cette page.");
            return;
        }

        gsap.registerPlugin(Draggable, InertiaPlugin, SplitText, ScrollTrigger);

        gsap.matchMedia().add("(max-width: 1023px)", () => {
            let launched = false;
            let splitInstance = null;
            let splitAnimation = null;
            const hints = slides ? [1, 2, 3, 4].map(n => document.getElementById(`slide${n}`)) : [];
            const [slide1, slide2, slide3, slide4] = hints;

            const spin = gsap.to(image, {
                rotation: 360,
                duration: 3,
                repeat: -1,
                ease: "none",
                paused: true
            });

            function ouvrirPochette() {
                cover.classList.toggle("coverAlt");
                if (slide4) gsap.to(slide4, { opacity: 0, duration: 0.5 });
            }
            pochette.addEventListener("click", ouvrirPochette);

            if (slide1) gsap.to(slide1, { opacity: 1, duration: 1 });

            // Le calcul centre-à-centre reste identique sur chaque page.
            function placerDisque(onComplete) {
                const a = cible.getBoundingClientRect();
                const b = cible2.getBoundingClientRect();
                const deltaX = a.left + a.width / 2 - b.left - b.width / 2;
                const deltaY = a.top + a.height / 2 - b.top - b.height / 2;

                gsap.to(wrapper, {
                    x: `+=${deltaX}`,
                    y: `+=${deltaY}`,
                    duration: 1,
                    ease: "power2.out",
                    onComplete() {
                        Draggable.get(wrapper)?.update();
                        onComplete?.();
                    }
                });
            }

            const disqueDrag = Draggable.create(wrapper, {
                bounds: plateau,
                inertia: false,
                onDragEnd() {
                    if (slide1) {
                        gsap.to(slide1, { opacity: 0, duration: 0.5 });
                        gsap.to(slide2, { opacity: 1, duration: 0.5, delay: 0.5 });
                    }

                    if (Draggable.hitTest(cible2, cible3, "50%")) {
                        placerDisque(() => {
                            if (slide2) {
                                gsap.to(slide2, { opacity: 0, duration: 0.5 });
                                gsap.to(slide3, { opacity: 1, duration: 0.5, delay: 0.5 });
                            }
                        });
                    } else {
                        spin.pause();
                    }
                }
            })[0];

            const brasDrag = Draggable.create(arm, {
                type: "rotation",
                bounds: { minRotation: 0, maxRotation: 55 },
                inertia: false,
                zIndexBoost: true,
                onDragEnd() {
                    if (slide3) gsap.to(slide3, { opacity: 0, duration: 0.5 });

                    const disquePlace = Draggable.hitTest(cible, cible2, "50%");
                    const brasPlace = Draggable.hitTest(image, armImage, "10%");

                    if (disquePlace && brasPlace) {
                        launched = true;
                        spin.resume();
                        if (slide4) gsap.to(slide4, { opacity: 1, duration: 0.5, delay: 1 });

                        // Ne pas redécouper le texte à chaque déplacement du bras.
                        if (splitText && !splitInstance) {
                            splitInstance = SplitText.create(text[0], {
                                type: "words",
                                autoSplit: true,
                                onSplit(self) {
                                    splitAnimation = gsap.from(self.words, {
                                        duration: 1,
                                        y: -100,
                                        autoAlpha: 0,
                                        stagger: 0.1
                                    });
                                    return splitAnimation;
                                }
                            });
                        }

                        gsap.to(text, { opacity: 1, duration: 4 });
                    } else {
                        spin.pause();
                        gsap.to(text, { opacity: 0, duration: 4 });
                    }
                }
            })[0];

            // Déclenchement automatique au scroll, une seule fois par activation mobile.
            const scrollTrigger = ScrollTrigger.create({
                trigger: table,
                start: "bottom 80%",
                once: true,
                onEnter() {
                    if (launched) return;
                    launched = true;
                    if (hints.length) gsap.to(hints.filter(Boolean), { opacity: 0, duration: 0.5 });

                    placerDisque(() => {
                        gsap.to(arm, {
                            rotation: 55,
                            duration: 1,
                            ease: "power2.out",
                            onComplete() {
                                brasDrag.update();
                                spin.resume();
                                gsap.to(text, { opacity: 1, duration: scrollRevealDuration });
                            }
                        });
                    });
                }
            });

            // Indispensable lorsque la fenêtre passe de mobile à desktop.
            return () => {
                scrollTrigger.kill();
                disqueDrag.kill();
                brasDrag.kill();
                pochette.removeEventListener("click", ouvrirPochette);
                cover.classList.remove("coverAlt");
                spin.kill();
                gsap.killTweensOf([wrapper, arm, image, ...text, ...hints.filter(Boolean)]);
                splitAnimation?.kill();
                splitInstance?.revert();
            };
        });
    };
})();
