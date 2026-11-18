function format_agent(nom) {
    var lien_agent = nom.toLowerCase();
    lien_agent = lien_agent.replace(/ /g, '-');
    lien_agent = lien_agent.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return lien_agent;
}

// Récupère le numéro de téléphone
function get_phone() {
    var numero = document.getElementById("numero").value;
    numero = numero.replace(/\s/g, '');
    numero = numero.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    return numero;
}

// Récupère le RSAC
function get_RSAC() {
    var rsac = document.getElementById("rsac").value.trim();
    return rsac ? "Agent commercial indépendant au nom de Liberkeys - R.S.A.C " + rsac : "";
}

// Récupère la photo
function get_photo() {
    var imageInput = document.getElementById('imageInput');
    var image1 = new Image();
    console.log(imageInput.files[0])
    console.log(imageInput)
    try {
        image1.src = URL.createObjectURL(imageInput.files[0]);
    } catch (error) {
        return null;
    }
    return image1.src;
}

// Génère le QRCode
function get_QRCode(lien_agent) {
    const CodeQR = new QRCodeStyling({
        width: 200,
        height: 200,
        type: "png",
        data: `https://liberkeys.com/agents/${lien_agent}`,
        image: "https://uploads-ssl.webflow.com/6022985415e9f66f2904c07b/65eed933aa7b1a8118ed5b37_lk.png",
        margin: 0,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q"
        },
        imageOptions: {
            crossOrigin: "anonymous",
            imageSize: 0.3,
            margin: 0
        },
        dotsOptions: {
            type: "square",
            color: "#241c1a"
        },
        backgroundOptions: {
            color: "#ffffff"
        },
        dotsOptionsHelper: {
            colorType: {
                single: true,
                gradient: false
            },
            gradient: {
                linear: true,
                radial: false,
                color1: "#6a1a4c",
                color2: "#6a1a4c",
                rotation: "0"
            }
        },
        cornersDotOptions: {
            type: "square",
            color: "#241c1a"
        }
    });
    return CodeQR;
}

async function image_to_png(imgValue) {
    let pngImageBytes = await fetch(imgValue).then(res => res.arrayBuffer())
    return pngImageBytes;
}

async function qr_to_png(lien_agent) {
    const qrCode = new QRCodeStyling({
        width: 400,
        height: 400,
        type: "png",
        data: `https://liberkeys.com/agents/${lien_agent}`,
        image: "https://uploads-ssl.webflow.com/6022985415e9f66f2904c07b/65eed933aa7b1a8118ed5b37_lk.png",
        margin: 0,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q"
        },
        imageOptions: {
            crossOrigin: "anonymous",
            imageSize: 0.4,
            margin: 0
        },
        dotsOptions: {
            type: "square",
            color: "#241c1a"
        },
        backgroundOptions: {
            color: "#ffffff"
        },
        dotsOptionsHelper: {
            colorType: {
                single: true,
                gradient: false
            },
            gradient: {
                linear: true,
                radial: false,
                color1: "#6a1a4c",
                color2: "#6a1a4c",
                rotation: "0"
            }
        },
        cornersDotOptions: {
            type: "square",
            color: "#241c1a"
        }
    });
    let pngImageBytes = await qrCode.getRawData("png").then(res => res.arrayBuffer())
    return pngImageBytes;
}

// Récupère le métier
function get_metier() {
    var metier = document.querySelector('input[name="metier"]:checked').value;
    return metier;
}

// Dessine une image
function draw_Image(source, page, axeX, axeY, hauteur, largeur) {
    page.drawImage(source, {
        x: axeX,
        y: axeY,
        width: largeur,
        height: hauteur
    })
}

// Dessine du texte sur la page
function draw_Text(source, page, axeX, axeY, taille, police, couleur, angle) {
    
    // Dessine le texte à la position spécifiée
    page.drawText(source, {
        x: axeX,
        y: axeY,
        size: taille,
        font: police,
        color: couleur,
        rotate: degrees(angle),
    });
}

// Récupère les bibliothèques nécessaires
const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib

// Définition des couleurs
var beige = rgb(0.99, 0.95, 0.93);
var marron = rgb(0.14, 0.11, 0.10);
var orange = rgb(0.93, 0.58, 0.45);
var rouge = rgb(1, 0, 0);

// Définition de la police
var ppsansregu = 'https://cdn.jsdelivr.net/gh/theoliberkeys/assets-agents/ppsansregu.otf';
var ppsansextra = 'https://cdn.jsdelivr.net/gh/theoliberkeys/assets-agents/ppsansextra.otf';

// Adresse des fichiers du repo (modèles PDF + polices)
// Fichiers lus sur GitHub (raw), branche main : un nouveau modèle déposé est pris en compte en ~5 min
var repoV2 = 'https://raw.githubusercontent.com/MktLK/assets-agents-v2/main/';
var latoregu = repoV2 + 'lato-regular.ttf';
var modelePanneau = repoV2 + 'panneau_bpce.pdf'; // panneau avec QR code (option)
var modelePanneauPhoto = repoV2 + 'Panneau%20BPCE%205.pdf';
var modelePanneauSansPhoto = repoV2 + 'Panneau%20BPCE%206.pdf';
var modeleFlyer = repoV2 + 'flyer_bpce.pdf';
var modeleCarte = repoV2 + 'carte_bpce.pdf';

// Vrai si l'agent a coché "Une mandataire immobilier" (accord au féminin)
function est_feminin(metier) {
    return /^\s*une\b|conseill[eè]re/i.test(metier || '');
}

// Bas de la zone visible de la page (Canva exporte avec un fond perdu : CropBox décalée)
function origine_y(page) {
    try {
        const cb = page.node.lookup(PDFLib.PDFName.of('CropBox'), PDFLib.PDFArray)
        return cb.lookup(1, PDFLib.PDFNumber).value()
    } catch (e) {
        return 0
    }
}

// Réduit la taille d'un texte jusqu'à ce qu'il tienne dans la largeur max
function taille_max(texte, police, taille, largeurMax) {
    while (taille > 4 && police.widthOfTextAtSize(texte, taille) > largeurMax) taille -= 0.5;
    return taille;
}

// Largeur d'un texte avec espacement des lettres (em = fraction de la taille, comme dans Canva)
function largeur_espacee(texte, police, taille, em) {
    return police.widthOfTextAtSize(texte, taille) + em * taille * Math.max(texte.length - 1, 0);
}

// Dessine un texte lettre par lettre avec espacement (pdf-lib 1.4 n'a pas d'interlettrage)
function draw_Text_espace(texte, page, x, y, taille, police, couleur, em) {
    for (const lettre of texte) {
        draw_Text(lettre, page, x, y, taille, police, couleur, 0);
        x += police.widthOfTextAtSize(lettre, taille) + em * taille;
    }
}

// Panneau principal recto-verso (V2 - DA BPCE) : page 1 "À vendre !", page 2 "C'est vendu !"
// Fond : PDF 1984.5 x 1701 pt. Deux modèles : avec photo (rond + trait) ou sans photo (bloc centré).
async function panneau(nom, numero, photo) {
    const avecPhoto = photo !== null
    const existingPdfBytes = await fetch(avecPhoto ? modelePanneauPhoto : modelePanneauSansPhoto).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    pdfDoc.registerFontkit(fontkit)
    const ppextra = await pdfDoc.embedFont(await fetch(ppsansextra).then(res => res.arrayBuffer()))
    const ppregu = await pdfDoc.embedFont(await fetch(ppsansregu).then(res => res.arrayBuffer()))

    let pngImage = null
    if (avecPhoto) {
        pngImage = await pdfDoc.embedPng(await fetch(photo).then(res => res.arrayBuffer()))
    }

    const rsacText = get_RSAC()
    // Centre du bloc texte : à droite du trait avec photo, centre de la page sans photo
    const centreX = avecPhoto ? 1248.9 : 992.25
    const largeurMax = avecPhoto ? 1200 : 1600
    const espacementNom = 0.04 // interlettrage du nom dans le modèle Canva
    let tailleNom = 90.98
    while (tailleNom > 20 && largeur_espacee(nom, ppregu, tailleNom, espacementNom) > largeurMax) tailleNom -= 0.5
    const largeurNom = largeur_espacee(nom, ppregu, tailleNom, espacementNom)
    const tailleNum = taille_max(numero, ppextra, 144.1, 1200)

    for (const page of pdfDoc.getPages()) {
        // Canva ajoute un fond perdu : on décale tout de l'origine de la zone visible
        const oy = origine_y(page)
        if (pngImage) draw_Image(pngImage, page, 154.8, 378 + oy, 380.8, 380.8)
        draw_Text_espace(nom, page, centreX - largeurNom / 2, 667.7 + oy, tailleNom, ppregu, marron, espacementNom)
        draw_Text(numero, page, centreX - ppextra.widthOfTextAtSize(numero, tailleNum) / 2, 498.2 + oy, tailleNum, ppextra, marron, 0)
        // Mention légale verticale (blanc) sur le bord droit, lue de bas en haut
        if (rsacText) {
            const t = taille_max(rsacText, ppregu, 14, 1400)
            draw_Text(rsacText, page, 1961.4, 1018 + oy, t, ppregu, rgb(1, 1, 1), 90)
        }
    }

    return await pdfDoc.save();
}

// Panneau avec QR code (option "Panneau avec QR Code") : ancien modèle panneau_bpce.pdf
async function panneau_qr(nom, numero, photo) {
    const existingPdfBytes = await fetch(modelePanneau).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    pdfDoc.registerFontkit(fontkit)
    const ppextra = await pdfDoc.embedFont(await fetch(ppsansextra).then(res => res.arrayBuffer()))
    const ppregu = await pdfDoc.embedFont(await fetch(ppsansregu).then(res => res.arrayBuffer()))

    const pages = pdfDoc.getPages()

    // Photo de l'agent (avec sa bordure orange)
    let pngImage = null
    if (photo !== null) {
        pngImage = await pdfDoc.embedPng(await fetch(photo).then(res => res.arrayBuffer()))
    }

    // QR code vers la page de l'agent
    const qrImage = await pdfDoc.embedPng(await qr_to_png(format_agent(nom)))

    const rsacText = get_RSAC()
    const centreX = 1321.5 // centre de la colonne de droite

    // Positions mesurées sur ta version remplie (Canva). Sans photo : nom plus grand, remonté.
    const tailleNom = taille_max(nom, ppregu, pngImage ? 84.7 : 110, 900)
    const yNom = pngImage ? 477.4 : 600
    const tailleNum = taille_max(numero, ppextra, 117.9, 980)

    for (const page of pages) {
        // Canva ajoute un fond perdu : on décale tout de l'origine de la zone visible
        const oy = origine_y(page)
        draw_Image(qrImage, page, 209.1, 407.2 + oy, 391.4, 391.4)
        if (pngImage) draw_Image(pngImage, page, 1173.1, 554.7 + oy, 297.7, 297.7)
        draw_Text(nom, page, centreX - ppregu.widthOfTextAtSize(nom, tailleNom) / 2, yNom + oy, tailleNom, ppregu, marron, 0)
        draw_Text(numero, page, centreX - ppextra.widthOfTextAtSize(numero, tailleNum) / 2, 345.4 + oy, tailleNum, ppextra, marron, 0)
        if (rsacText) {
            draw_Text(rsacText, page, 1355.8 - ppregu.widthOfTextAtSize(rsacText, 14) / 2, 277.9 + oy, 14, ppregu, marron, 0)
        }
    }

    return await pdfDoc.save();
}

// Carte de visite (V2 - DA BPCE), fond recto-verso 156 x 235.5 pt (55 x 83 mm)
// Le modèle du repo remplace le fichier passé par la page ("fichier" est ignoré).
// "Mandataire immobilier", le site et le verso sont déjà dans le fond.
// Photo (avec sa bordure orange) en bas à gauche seulement si photo !== null.
async function carte_de_visite(nom, mail, metier, numero, fichier, photo) {
    const existingPdfBytes = await fetch(modeleCarte).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    pdfDoc.registerFontkit(fontkit)
    const ppextra = await pdfDoc.embedFont(await fetch(ppsansextra).then(res => res.arrayBuffer()))
    const ppregu = await pdfDoc.embedFont(await fetch(ppsansregu).then(res => res.arrayBuffer()))

    const page = pdfDoc.getPages()[0]
    const { width } = page.getSize()
    // Canva ajoute un fond perdu : on décale tout de l'origine de la zone visible
    const oy = origine_y(page)
    const x = 15.6
    const largeurMax = 125

    // Prénom (regular) puis NOM (extra bold, majuscules), en orange
    const elPrenom = document.getElementById("prenom")
    const elNom = document.getElementById("nom")
    const prenom = elPrenom ? elPrenom.value.trim() : nom
    const nomFamille = elNom ? elNom.value.trim().toUpperCase() : ""
    draw_Text(prenom, page, x, 188.7 + oy, taille_max(prenom, ppregu, 10, largeurMax), ppregu, orange, 0)
    if (nomFamille) {
        draw_Text(nomFamille, page, x, 175.5 + oy, taille_max(nomFamille, ppextra, 10, largeurMax), ppextra, orange, 0)
    }

    // Téléphone et e-mail (beige)
    draw_Text(numero, page, x, 142.7 + oy, taille_max(numero, ppregu, 7, largeurMax), ppregu, beige, 0)
    draw_Text(mail, page, x, 128.2 + oy, taille_max(mail, ppregu, 6.5, largeurMax), ppregu, beige, 0)

    // Mention légale centrée en bas (gris clair)
    const rsacText = get_RSAC()
    if (rsacText) {
        const t = taille_max(rsacText, ppregu, 3.06, width - 20)
        draw_Text(rsacText, page, width / 2 - ppregu.widthOfTextAtSize(rsacText, t) / 2, 6.4 + oy, t, ppregu, rgb(0.85, 0.85, 0.85), 0)
    }

    // Photo ronde (avec sa bordure orange)
    if (photo !== null) {
        const pngImage = await pdfDoc.embedPng(await fetch(photo).then(res => res.arrayBuffer()))
        draw_Image(pngImage, page, 15.1, 26.0 + oy, 62.9, 62.9)
    }

    // QR code dans le carré blanc
    const qrImage = await pdfDoc.embedPng(await qr_to_png(format_agent(nom)))
    draw_Image(qrImage, page, 107.1, 42.9 + oy, 24.7, 24.7)

    return await pdfDoc.save();
}

// Fonction pour réaliser le flyer (V2 - DA BPCE), fond A5 recto-verso 419.25 x 595.5 pt
// Les infos de l'agent sont écrites sur le verso (page 2). Photo seulement si photo !== null.
async function flyer(nom, mail, metier, numero, photo) {
    const feminin = est_feminin(metier)
    const phrase1 = "Dans la vente ou l\u2019achat de votre bien,"
    const phrase2 = "je serai votre " + (feminin ? "meilleure alliée" : "meilleur allié") + " immobilier"

    const existingPdfBytes = await fetch(modeleFlyer).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    pdfDoc.registerFontkit(fontkit)
    const ppextra = await pdfDoc.embedFont(await fetch(ppsansextra).then(res => res.arrayBuffer()))
    const ppregu = await pdfDoc.embedFont(await fetch(ppsansregu).then(res => res.arrayBuffer()))
    const lato = await pdfDoc.embedFont(await fetch(latoregu).then(res => res.arrayBuffer()))

    const page = pdfDoc.getPages()[1]
    const { width } = page.getSize()
    // Canva ajoute un fond perdu : on décale tout de l'origine de la zone visible
    const oy = origine_y(page)
    const centre = width / 2

    // Phrase d'accroche (accordée selon un/une mandataire)
    draw_Text(phrase1, page, centre - lato.widthOfTextAtSize(phrase1, 13.3) / 2, 486.8 + oy, 13.3, lato, marron, 0)
    draw_Text(phrase2, page, centre - lato.widthOfTextAtSize(phrase2, 13.3) / 2, 468.8 + oy, 13.3, lato, marron, 0)

    // Bloc agent : aligné à gauche à côté de la photo, ou centré sans photo
    const lignes = [
        { texte: nom, police: ppextra, couleur: orange, y: 421.1 },
        { texte: "Mandataire immobilier", police: ppregu, couleur: marron, y: 400.9 },
        { texte: numero, police: ppregu, couleur: marron, y: 380.7 },
        { texte: mail, police: ppregu, couleur: marron, y: 360.4 },
    ]
    const largeurMax = photo !== null ? 250 : 340
    for (const l of lignes) {
        const taille = taille_max(l.texte, l.police, 14, largeurMax)
        const x = photo !== null ? 41.9 : centre - l.police.widthOfTextAtSize(l.texte, taille) / 2
        draw_Text(l.texte, page, x, l.y + oy, taille, l.police, l.couleur, 0)
    }

    // Photo ronde (avec sa bordure orange)
    if (photo !== null) {
        const pngImage = await pdfDoc.embedPng(await fetch(photo).then(res => res.arrayBuffer()))
        draw_Image(pngImage, page, 299.9, 356.9 + oy, 77.4, 77.4)
    }

    // QR code dans le carré blanc
    const qrImage = await pdfDoc.embedPng(await qr_to_png(format_agent(nom)))
    draw_Image(qrImage, page, 188.4, 119.7 + oy, 42.5, 42.5)

    // Mention légale (blanc, en bas)
    const rsac = get_RSAC()
    const mention = (rsac ? rsac + " - " : "") + "Ne pas jeter sur la voie publique"
    draw_Text(mention, page, centre - ppregu.widthOfTextAtSize(mention, 4) / 2, 54.1 + oy, 4, ppregu, rgb(1, 1, 1), 0)

    return await pdfDoc.save();
}
