/* =====================================================================
   PLATINE MOBILE (V1) — logique commune à toutes les pages
   ---------------------------------------------------------------------
   Active uniquement sur les écrans de moins de 1024 px.
   Chaque page appelle initPlatineMobile() avec son propre disque
   (voir C.V.js, contact.js, portfolio.js, etc.).

   Ce que fait l'utilisateur :
     1. Il glisse le disque sur le plateau.
        → Le disque se centre tout seul sur le plateau.
     2. Il tourne le bras jusqu'au disque.
        → Le disque tourne et le texte de la page apparaît.

   S'il fait défiler la page sans toucher à la platine, tout se lance
   automatiquement (voir lancerAutomatiquement).

   Options possibles :
     wrapperId            id du <div> qui contient le disque (obligatoire)
     imageId              id de l'<img> du disque (obligatoire)
     slides               true pour afficher les consignes (accueil)
     splitText            false pour ne pas animer le texte mot par mot
     scrollRevealDuration durée (en s) d'apparition du texte au scroll
   ===================================================================== */

function initPlatineMobile(options) {

    // -----------------------------------------------------------------
    // 1. Réglages
    // -----------------------------------------------------------------

    const ECRAN_MOBILE = "(max-width: 1023px)";

    // Angle du bras (en degrés) quand il est posé sur le disque.
    const ANGLE_BRAS_SUR_DISQUE = 55;

    // Options de la page, avec leur valeur par défaut.
    // (« ?? 1.5 » signifie : 1.5 si l'option n'a pas été donnée.)
    const afficherLesConsignes = options.slides === true;
    const animerMotParMot = options.splitText !== false;
    const dureeApparitionAuScroll = options.scrollRevealDuration ?? 1.5;


    // -----------------------------------------------------------------
    // 2. Éléments HTML
    // -----------------------------------------------------------------

    // Le disque : on déplace son conteneur, mais c'est l'image qui tourne.
    const conteneurDisque = document.getElementById(options.wrapperId);
    const imageDisque = document.getElementById(options.imageId);

    // Le bras : on fait tourner son conteneur.
    const conteneurBras = document.getElementById("p-bras");
    const imageBras = document.getElementById("bras");

    // Zone en bois : le disque ne peut pas en sortir.
    const zonePlatine = document.getElementById("super-table");

    // Bloc de la platine : sert de repère pour le déclenchement au scroll.
    const blocPlatine = document.getElementById("table");

    // Zones invisibles utilisées pour savoir où se trouve le disque.
    const centreDuPlateau = document.getElementById("cible");
    const centreDuDisque = document.getElementById("cible2");
    const surfaceDuPlateau = document.getElementById("cible3");

    // Pochette en haut à droite, qui ouvre le menu des pages.
    const pochette = document.getElementById("pochette");
    const menuPochette = document.getElementById("cover");

    const elementsObligatoires = [
        conteneurDisque, imageDisque, conteneurBras, imageBras,
        zonePlatine, blocPlatine, centreDuPlateau, centreDuDisque,
        surfaceDuPlateau, pochette, menuPochette
    ];

    if (elementsObligatoires.includes(null)) {
        console.warn("Platine : éléments HTML manquants sur cette page.");
        return;
    }

    // Le texte de la page, caché au départ.
    const blocsTexte = Array.from(zonePlatine.querySelectorAll(".text"));

    if (blocsTexte.length === 0) {
        console.warn("Platine : aucun bloc .text trouvé sur cette page.");
        return;
    }

    // Consignes affichées sur l'accueil (images « glisser le disque », etc.).
    // La case 0 correspond à la consigne n°1, la case 1 à la n°2, etc.
    let consignes = [];

    if (afficherLesConsignes) {
        consignes = [
            document.getElementById("slide1"), // Glisser le disque
            document.getElementById("slide2"), // Vers la platine
            document.getElementById("slide3"), // Bouger le bras
            document.getElementById("slide4")  // Toucher la pochette
        ];
    }


    gsap.registerPlugin(Draggable, InertiaPlugin, SplitText, ScrollTrigger);

    // Tout ce qui suit ne s'exécute que sur mobile. Si la fenêtre passe
    // en desktop, GSAP appelle la fonction nettoyer() renvoyée à la fin.
    gsap.matchMedia().add(ECRAN_MOBILE, function () {

        // -------------------------------------------------------------
        // 3. État de la platine
        // -------------------------------------------------------------

        // Passe à true dès que la musique a été lancée une première fois
        // (par l'utilisateur ou par le scroll).
        let platineLancee = false;

        // Découpage du texte mot par mot (créé une seule fois).
        let texteDecoupe = null;
        let animationDesMots = null;

        // Rotation infinie du disque, en pause au départ.
        const rotationDisque = gsap.to(imageDisque, {
            rotation: 360,
            duration: 3,
            repeat: -1,
            ease: "none",
            paused: true
        });


        // -------------------------------------------------------------
        // 4. Consignes (accueil uniquement)
        // -------------------------------------------------------------

        function afficherConsigne(numero, reglages = {}) {
            const consigne = consignes[numero - 1];
            if (!consigne) {
                return;
            }

            const duree = reglages.duree ?? 0.5;
            const delai = reglages.delai ?? 0;

            gsap.to(consigne, { opacity: 1, duration: duree, delay: delai });
        }

        function masquerConsigne(numero) {
            const consigne = consignes[numero - 1];
            if (!consigne) {
                return;
            }

            gsap.to(consigne, { opacity: 0, duration: 0.5 });
        }

        function masquerToutesLesConsignes() {
            masquerConsigne(1);
            masquerConsigne(2);
            masquerConsigne(3);
            masquerConsigne(4);
        }


        // -------------------------------------------------------------
        // 5. Pochette
        // -------------------------------------------------------------

        function ouvrirOuFermerMenuPochette() {
            menuPochette.classList.toggle("coverAlt");
            masquerConsigne(4);
        }


        // -------------------------------------------------------------
        // 6. Vérifications de position
        // -------------------------------------------------------------

        // Le centre du disque est-il au-dessus du plateau ?
        function disqueEstSurLePlateau() {
            return Draggable.hitTest(centreDuDisque, surfaceDuPlateau, "50%");
        }

        // Le disque est-il bien centré sur le plateau ?
        function disqueEstCentre() {
            return Draggable.hitTest(centreDuPlateau, centreDuDisque, "50%");
        }

        // Le bras touche-t-il le disque ?
        function brasToucheLeDisque() {
            return Draggable.hitTest(imageDisque, imageBras, "10%");
        }

        // Renvoie les coordonnées du centre d'un élément à l'écran.
        function centreDe(element) {
            const rectangle = element.getBoundingClientRect();

            return {
                x: rectangle.left + rectangle.width / 2,
                y: rectangle.top + rectangle.height / 2
            };
        }


        // -------------------------------------------------------------
        // 7. Actions
        // -------------------------------------------------------------

        // Déplace le disque pour que son centre tombe exactement
        // sur le centre du plateau, puis appelle quandTermine().
        function centrerDisqueSurPlateau(quandTermine) {
            const cible = centreDe(centreDuPlateau);
            const disque = centreDe(centreDuDisque);

            const distanceX = cible.x - disque.x;
            const distanceY = cible.y - disque.y;

            gsap.to(conteneurDisque, {
                x: "+=" + distanceX,
                y: "+=" + distanceY,
                duration: 1,
                ease: "power2.out",
                onComplete: function () {
                    // Draggable doit connaître la nouvelle position du disque.
                    glisserDisque.update();

                    if (quandTermine) {
                        quandTermine();
                    }
                }
            });
        }

        // Fait tomber les mots du texte un par un (une seule fois).
        function animerTexteMotParMot() {
            if (!animerMotParMot) {
                return;
            }

            // Déjà fait : on ne redécoupe pas le texte à chaque mouvement du bras.
            if (texteDecoupe !== null) {
                return;
            }

            texteDecoupe = SplitText.create(blocsTexte[0], {
                type: "words",
                autoSplit: true,
                onSplit: function (decoupage) {
                    animationDesMots = gsap.from(decoupage.words, {
                        duration: 1,
                        y: -100,
                        autoAlpha: 0,
                        stagger: 0.1
                    });
                    return animationDesMots;
                }
            });
        }

        function demarrerLaMusique() {
            platineLancee = true;
            rotationDisque.resume();
            afficherConsigne(4, { delai: 1 });
            animerTexteMotParMot();
            gsap.to(blocsTexte, { opacity: 1, duration: 4 });
        }

        function arreterLaMusique() {
            rotationDisque.pause();
            gsap.to(blocsTexte, { opacity: 0, duration: 4 });
        }


        // -------------------------------------------------------------
        // 8. Glisser-déposer du disque et du bras
        // -------------------------------------------------------------

        function quandLeDisqueEstLache() {
            masquerConsigne(1);
            afficherConsigne(2, { delai: 0.5 });

            if (disqueEstSurLePlateau()) {
                centrerDisqueSurPlateau(function () {
                    masquerConsigne(2);
                    afficherConsigne(3, { delai: 0.5 });
                });
            } else {
                rotationDisque.pause();
            }
        }

        function quandLeBrasEstLache() {
            masquerConsigne(3);

            if (disqueEstCentre() && brasToucheLeDisque()) {
                demarrerLaMusique();
            } else {
                arreterLaMusique();
            }
        }

        // Draggable.create() renvoie un tableau : on garde le premier élément.
        const glisserDisque = Draggable.create(conteneurDisque, {
            bounds: zonePlatine,
            inertia: false,
            onDragEnd: quandLeDisqueEstLache
        })[0];

        const glisserBras = Draggable.create(conteneurBras, {
            type: "rotation",
            bounds: { minRotation: 0, maxRotation: ANGLE_BRAS_SUR_DISQUE },
            inertia: false,
            zIndexBoost: true,
            onDragEnd: quandLeBrasEstLache
        })[0];


        // -------------------------------------------------------------
        // 9. Lancement automatique au scroll
        // -------------------------------------------------------------

        // Si l'utilisateur descend dans la page sans avoir lancé la platine,
        // on pose le disque, on baisse le bras et on affiche le texte.
        function lancerAutomatiquement() {
            if (platineLancee) {
                return;
            }

            platineLancee = true;
            masquerToutesLesConsignes();

            centrerDisqueSurPlateau(function () {
                gsap.to(conteneurBras, {
                    rotation: ANGLE_BRAS_SUR_DISQUE,
                    duration: 1,
                    ease: "power2.out",
                    onComplete: function () {
                        glisserBras.update();
                        rotationDisque.resume();
                        gsap.to(blocsTexte, { opacity: 1, duration: dureeApparitionAuScroll });
                    }
                });
            });
        }

        const declencheurScroll = ScrollTrigger.create({
            trigger: blocPlatine,
            start: "bottom 80%",
            once: true,
            onEnter: lancerAutomatiquement
        });


        // -------------------------------------------------------------
        // 10. Démarrage
        // -------------------------------------------------------------

        pochette.addEventListener("click", ouvrirOuFermerMenuPochette);
        afficherConsigne(1, { duree: 1 });


        // -------------------------------------------------------------
        // 11. Nettoyage quand on passe en desktop
        // -------------------------------------------------------------

        return function nettoyer() {
            declencheurScroll.kill();
            glisserDisque.kill();
            glisserBras.kill();
            rotationDisque.kill();

            pochette.removeEventListener("click", ouvrirOuFermerMenuPochette);
            menuPochette.classList.remove("coverAlt");

            const consignesPresentes = consignes.filter(function (consigne) {
                return consigne !== null;
            });

            gsap.killTweensOf([
                conteneurDisque,
                conteneurBras,
                imageDisque,
                ...blocsTexte,
                ...consignesPresentes
            ]);

            if (animationDesMots !== null) {
                animationDesMots.kill();
            }

            if (texteDecoupe !== null) {
                texteDecoupe.revert();
            }
        };
    });
}
