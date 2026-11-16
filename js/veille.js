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
// VEILLE : FLUX RSS GAMEDEV.JS WEEKLY
// ==========================
// Le site du flux bloque les requêtes venant d'un autre domaine (CORS + Cloudflare),
// on passe donc par rss2json qui lit le flux et le renvoie en JSON.
const FEED_URL = "https://gamedevjsweekly.com/feed.xml";
const API_URL = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(FEED_URL);

const NB_NUMEROS = 3;          // nombre de newsletters affichées
const NB_ARTICLES = 5;         // articles affichés par newsletter
const CACHE_KEY = "veille-gamedev";
const CACHE_DUREE = 3 * 60 * 60 * 1000; // 3 heures

// --- Cache local (évite de rappeler l'API à chaque visite) ---
function lireCache() {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cache && Date.now() - cache.date < CACHE_DUREE) return cache.items;
    } catch (e) { }
    return null;
}

function ecrireCache(items) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: Date.now(), items: items }));
    } catch (e) { }
}

// --- Récupération du flux ---
async function recupererFlux() {
    const cache = lireCache();
    if (cache) return cache;

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    if (data.status !== "ok") throw new Error(data.message || "Flux invalide");

    ecrireCache(data.items);
    return data.items;
}

// --- N'accepte que les liens http/https (sécurité) ---
function lienSur(href) {
    try {
        const url = new URL(href);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch (e) {
        return null;
    }
}

// --- Extrait les articles contenus dans la description HTML d'un numéro ---
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
    const date = new Date(pubDate.replace(" ", "T") + "Z");
    if (isNaN(date)) return "";
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// --- Affichage ---
function afficherFlux(items) {
    const flux = document.getElementById("flux");
    flux.replaceChildren();

    items.slice(0, NB_NUMEROS).forEach(function (item) {
        const numero = creer("article", "flux-numero");

        const titre = creer("h2", "flux-titre");
        const lienNumero = lienSur(item.link);
        titre.appendChild(lienNumero ? creerLien(lienNumero, item.title) : document.createTextNode(item.title));
        numero.appendChild(titre);

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

        flux.appendChild(numero);
    });
}

function afficherErreur() {
    const flux = document.getElementById("flux");
    flux.replaceChildren();

    const p = creer("p", "flux-status", "La veille est momentanément indisponible. Retrouvez les derniers numéros sur ");
    p.appendChild(creerLien("https://gamedevjsweekly.com/", "gamedevjsweekly.com"));
    p.appendChild(document.createTextNode("."));
    flux.appendChild(p);
}

recupererFlux()
    .then(afficherFlux)
    .catch(function (error) {
        console.error("Erreur flux RSS :", error);
        afficherErreur();
    });
