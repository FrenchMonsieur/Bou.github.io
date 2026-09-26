// Accueil : platine mobile, slides de guidage et révélation du texte.
initPlatineMobile({
    wrapperId: "p-disqueN0",
    imageId: "disqueN0",
    slides: true
});

// Carrousel desktop de l'accueil.
// Une carte active au centre, avec la précédente et la suivante visibles sur les côtés.
const carouselMedia = gsap.matchMedia();

carouselMedia.add("(min-width: 1024px)", () => {
    const wrapper = document.querySelector(".carousel-wrapper");

    if (!wrapper) {
        return;
    }

    const cards = gsap.utils.toArray(".carousel-card", wrapper);
    const prevButton = wrapper.querySelector(".carousel-arrow.prev");
    const nextButton = wrapper.querySelector(".carousel-arrow.next");

    if (cards.length < 2 || !prevButton || !nextButton) {
        return;
    }

    let activeIndex = 0;
    let isAnimating = false;

    const wrapIndex = gsap.utils.wrap(0, cards.length);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : 0.55;

    // 115 % d'une carte de 30 % laisse environ 5 % d'espace entre les cartes.
    const sideOffset = 115;
    const sideOpacity = 0.35;
    const sideScale = 0.92;

    function getSlot(cardIndex, centerIndex) {
        if (cardIndex === centerIndex) {
            return 0;
        }

        if (cardIndex === wrapIndex(centerIndex - 1)) {
            return -1;
        }

        if (cardIndex === wrapIndex(centerIndex + 1)) {
            return 1;
        }

        return null;
    }

    function getAppearance(slot) {
        if (slot === 0) {
            return {
                xPercent: 0,
                autoAlpha: 1,
                scale: 1,
                zIndex: 3
            };
        }

        if (slot === -1 || slot === 1) {
            return {
                xPercent: slot * sideOffset,
                autoAlpha: sideOpacity,
                scale: sideScale,
                zIndex: 2
            };
        }

        return {
            autoAlpha: 0,
            scale: sideScale,
            zIndex: 1
        };
    }

    cards.forEach((card, index) => {
        const slot = getSlot(index, activeIndex);

        gsap.set(card, getAppearance(slot));
        card.setAttribute("aria-hidden", slot === 0 ? "false" : "true");
    });

    function showCard(index) {
        if (isAnimating) {
            return;
        }

        const nextIndex = wrapIndex(index);

        if (nextIndex === activeIndex) {
            return;
        }

        isAnimating = true;

        const timeline = gsap.timeline({
            defaults: {
                duration,
                ease: "power3.inOut"
            },
            onComplete: () => {
                activeIndex = nextIndex;
                isAnimating = false;
            }
        });

        cards.forEach((card, cardIndex) => {
            const oldSlot = getSlot(cardIndex, activeIndex);
            const newSlot = getSlot(cardIndex, nextIndex);
            const target = getAppearance(newSlot);

            card.setAttribute("aria-hidden", newSlot === 0 ? "false" : "true");

            // Une carte qui passe directement de gauche à droite (ou inversement)
            // est replacée discrètement au lieu de traverser la carte centrale.
            if (
                oldSlot !== null &&
                newSlot !== null &&
                Math.abs(newSlot - oldSlot) > 1
            ) {
                timeline.set(card, {
                    xPercent: target.xPercent,
                    autoAlpha: 0,
                    scale: target.scale,
                    zIndex: target.zIndex
                }, 0);

                timeline.to(card, {
                    autoAlpha: target.autoAlpha
                }, duration ? 0.2 : 0);

                return;
            }

            // Carte qui entre dans les trois positions visibles.
            if (oldSlot === null && newSlot !== null) {
                timeline.set(card, {
                    xPercent: target.xPercent,
                    autoAlpha: 0,
                    scale: target.scale,
                    zIndex: target.zIndex
                }, 0);

                timeline.to(card, target, duration ? 0.1 : 0);
                return;
            }

            timeline.to(card, target, 0);
        });
    }

    const showNext = () => showCard(activeIndex + 1);
    const showPrevious = () => showCard(activeIndex - 1);

    nextButton.addEventListener("click", showNext);
    prevButton.addEventListener("click", showPrevious);

    return () => {
        nextButton.removeEventListener("click", showNext);
        prevButton.removeEventListener("click", showPrevious);
        gsap.killTweensOf(cards);
    };
});

