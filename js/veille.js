// ==========================
// PLATINE : uniquement en mobile (moins de 1024 px)
// ==========================
if (window.matchMedia("(max-width: 1023px)").matches) {

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
    const spin = gsap.to("#disque_veille", {
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
    Draggable.create("#p-disque_veille", {
        bounds: document.getElementById("super-table"),
        inertia: false,

        onClick: function () { },

        onDragEnd: function () {

            const ciblesOK = Draggable.hitTest("#cible", "#cible2", "50%");
            const magnetok = Draggable.hitTest("#cible2", "#cible3", "50%");

            if (ciblesOK) { }

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

                gsap.to("#p-disque_veille", {
                    x: `+=${deltaX}`,
                    y: `+=${deltaY}`,
                    duration: 1,
                    ease: "power2.out",
                    onComplete: function () {
                        Draggable.get("#p-disque_veille").update();
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

        onClick: function () { },

        onDragEnd: function () {

            const ciblesOK = Draggable.hitTest("#cible", "#cible2", "50%");
            const sync = Draggable.hitTest("#disque_veille", "#bras", "10%");

            if (sync && ciblesOK) {

                launched = true;
                spin.resume();

                gsap.to("#text", {
                    opacity: 1,
                    duration: 1.5
                });

            } else {

                spin.pause();

                gsap.to("#text", {
                    opacity: 0,
                    duration: 1.5
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

        gsap.to("#p-disque_veille", {
            x: `+=${deltaX}`,
            y: `+=${deltaY}`,
            duration: 1,
            ease: "power2.out",
            onComplete: function () {
                Draggable.get("#p-disque_veille").update();

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
}

// ==========================
// VEILLE : FLUX RSS (Gamedev.js Weekly + InfoQ Docker)
// ==========================
// Les sites des flux bloquent les requêtes venant d'un autre domaine (CORS + Cloudflare),
// on passe donc par rss2json qui lit le flux et le renvoie en JSON.
const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
const CACHE_DUREE = 168 * 60 * 60 * 1000; // 7j
const CHOIX_KEY = "veille-source";        // dernière face choisie

const SOURCES = {
    gamedev: {
        nom: "Gamedev.js Weekly",
        site: "https://gamedevjsweekly.com/",
        siteLabel: "gamedevjsweekly.com",
        flux: "https://gamedevjsweekly.com/feed.xml",
        cache: "veille-gamedev",
        intro: "Ma veille sur le développement de jeux web, alimentée automatiquement par le flux RSS de ",
        nbItems: 3,       // nombre de newsletters affichées
        afficher: afficherNumero
    },
    docker: {
        nom: "InfoQ – Docker",
        site: "https://www.infoq.com/docker/",
        siteLabel: "infoq.com",
        flux: "https://feed.infoq.com/docker",
        cache: "veille-docker",
        intro: "Ma veille sur Docker et la conteneurisation, alimentée automatiquement par le flux RSS d'",
        nbItems: 6,       // nombre d'articles affichés
        afficher: afficherArticleInfoq
    }
};

const NB_ARTICLES = 5; // articles affichés par newsletter Gamedev.js

// on conserve le flux en cache pour éviter d'appeler l'API à chaque chargement de la page
function lireCache(cle) {
    try {
        const cache = JSON.parse(localStorage.getItem(cle));
        if (cache && Date.now() - cache.date < CACHE_DUREE) return cache.items;
    } catch (e) { }
    return null;
}

function ecrireCache(cle, items) {
    try {
        localStorage.setItem(cle, JSON.stringify({ date: Date.now(), items: items }));
    } catch (e) { }
}

async function recupererFlux(source) {
    const cache = lireCache(source.cache);
    if (cache) return cache;

    const response = await fetch(RSS2JSON + encodeURIComponent(source.flux));
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    if (data.status !== "ok") throw new Error(data.message || "Flux invalide");

    ecrireCache(source.cache, data.items);
    return data.items;
}

// on accepte que les liens http/https pour des raisons de sécurité
function lienSur(href) {
    try {
        const url = new URL(href);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch (e) {
        return null;
    }
}

// --- Extrait les articles contenus dans la description HTML d'un numéro Gamedev.js ---
// Chaque article est un <p> : <a>titre</a><br> résumé <span>auteur</span>
function extraireArticles(descriptionHtml) {
    const doc = new DOMParser().parseFromString(descriptionHtml, "text/html");
    const articles = [];
    let rubrique = "";

    for (const el of doc.body.children) {
        if (el.tagName === "H2") {
            rubrique = el.textContent.trim();
            continue;
        }

        const lien = el.tagName === "P" ? el.querySelector("a") : null;
        const href = lien ? lienSur(lien.getAttribute("href")) : null;
        if (!href) continue;

        const auteur = el.querySelector("span");
        const copie = el.cloneNode(true);
        copie.querySelectorAll("a, span").forEach(function (n) { n.remove(); });

        articles.push({
            rubrique: rubrique,
            titre: lien.textContent.trim(),
            lien: href,
            resume: copie.textContent.trim(),
            auteur: auteur ? auteur.textContent.trim() : ""
        });

        if (articles.length >= NB_ARTICLES) break;
    }
    return articles;
}

// --- Petit utilitaire pour créer un élément avec du texte ---
function creer(tag, classe, texte) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texte) el.textContent = texte; // textContent : pas d'injection HTML possible
    return el;
}

function creerLien(href, texte) {
    const a = creer("a", "", texte);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
}

function formaterDate(pubDate) {
    const date = new Date((pubDate || "").replace(" ", "T") + "Z");
    if (isNaN(date)) return "";
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function creerTitre(item) {
    const titre = creer("h2", "flux-titre");
    const lien = lienSur(item.link);
    titre.appendChild(lien ? creerLien(lien, item.title) : document.createTextNode(item.title));
    return titre;
}

// --- Gamedev.js : un item = une newsletter qui contient plusieurs articles ---
function afficherNumero(item) {
    const numero = creer("article", "flux-numero");
    numero.appendChild(creerTitre(item));

    const date = formaterDate(item.pubDate);
    if (date) numero.appendChild(creer("p", "flux-date", "Publié le " + date));

    const liste = creer("ul", "flux-articles");
    extraireArticles(item.description || "").forEach(function (article) {
        const li = creer("li", "flux-article");
        if (article.rubrique) li.appendChild(creer("span", "flux-rubrique", article.rubrique));

        const h3 = creer("h3");
        h3.appendChild(creerLien(article.lien, article.titre));
        li.appendChild(h3);

        if (article.resume) li.appendChild(creer("p", "flux-resume", article.resume));
        if (article.auteur) li.appendChild(creer("p", "flux-auteur", article.auteur));
        liste.appendChild(li);
    });
    numero.appendChild(liste);
    return numero;
}

// --- InfoQ : un item = un article (description : <img><p>résumé</p><i>By auteur</i>) ---
function afficherArticleInfoq(item) {
    const article = creer("article", "flux-numero");

    const rubriques = (item.categories || []).slice(0, 3);
    if (rubriques.length) {
        const tags = creer("div", "flux-tags");
        rubriques.forEach(function (c) { tags.appendChild(creer("span", "flux-rubrique", c)); });
        article.appendChild(tags);
    }

    article.appendChild(creerTitre(item));

    const date = formaterDate(item.pubDate);
    const infos = [date ? "Publié le " + date : "", item.author ? "par " + item.author : ""]
        .filter(Boolean).join(" · ");
    if (infos) article.appendChild(creer("p", "flux-date", infos));

    const doc = new DOMParser().parseFromString(item.description || "", "text/html");
    const p = doc.querySelector("p");
    const resume = (p ? p.textContent : doc.body.textContent).trim();
    if (resume) article.appendChild(creer("p", "flux-resume", resume));

    return article;
}

// --- Affichage ---
function afficherFlux(source, items) {
    const flux = document.getElementById("flux");
    flux.replaceChildren();
    items.slice(0, source.nbItems).forEach(function (item) {
        flux.appendChild(source.afficher(item));
    });
}

function afficherStatut(texte) {
    const flux = document.getElementById("flux");
    flux.replaceChildren(creer("p", "flux-status", texte));
}

function afficherErreur(source) {
    const flux = document.getElementById("flux");
    flux.replaceChildren();

    const p = creer("p", "flux-status", "La veille est momentanément indisponible. Retrouvez les derniers articles sur ");
    p.appendChild(creerLien(source.site, source.siteLabel));
    p.appendChild(document.createTextNode("."));
    flux.appendChild(p);
}

function afficherIntro(source) {
    const intro = document.getElementById("flux-intro");
    intro.replaceChildren(document.createTextNode(source.intro));
    intro.appendChild(creerLien(source.site, source.nom));
    intro.appendChild(document.createTextNode("."));
}

// ==========================
// SWITCH FAÇON BOOMBOX (Face A / Face B)
// ==========================
const touches = document.querySelectorAll(".switch-key");
const leds = document.querySelectorAll(".switch-led");
let sourceActive = null;

function choisirSource(id) {
    const source = SOURCES[id];
    if (!source || id === sourceActive) return;
    sourceActive = id;

    touches.forEach(function (t, i) {
        const on = t.dataset.source === id;
        t.classList.toggle("on", on);
        t.setAttribute("aria-pressed", on);
        if (leds[i]) leds[i].classList.toggle("on", on);
    });

    try { localStorage.setItem(CHOIX_KEY, id); } catch (e) { }

    afficherIntro(source);
    afficherStatut("Chargement des derniers articles…");

    recupererFlux(source)
        .then(function (items) {
            if (sourceActive === id) afficherFlux(source, items); // ignore une réponse arrivée trop tard
        })
        .catch(function (error) {
            console.error("Erreur flux RSS :", error);
            if (sourceActive === id) afficherErreur(source);
        });
}

touches.forEach(function (t) {
    t.addEventListener("click", function () { choisirSource(t.dataset.source); });
});

let choixInitial = "gamedev";
try { choixInitial = localStorage.getItem(CHOIX_KEY) || choixInitial; } catch (e) { }
choisirSource(SOURCES[choixInitial] ? choixInitial : "gamedev");
