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
var repoV2 = 'https://cdn.jsdelivr.net/gh/MktLK/assets-agents-v2@main/';
var latoregu = repoV2 + 'lato-regular.ttf';
var modelePanneau = repoV2 + 'panneau_bpce.pdf';
var modeleFlyer = repoV2 + 'flyer_bpce.pdf';

// Vrai si l'agent a coché "Une mandataire immobilier" (accord au féminin)
function est_feminin(metier) {
    return /^\s*une\b|conseill[eè]re/i.test(metier || '');
}

// Réduit la taille d'un texte jusqu'à ce qu'il tienne dans la largeur max
function taille_max(texte, police, taille, largeurMax) {
    while (taille > 4 && police.widthOfTextAtSize(texte, taille) > largeurMax) taille -= 0.5;
    return taille;
}

// Panneau unique recto-verso (V2 - DA BPCE) : page 1 "À vendre", page 2 "C'est vendu"
// Fond : PDF 1984.5 x 1701 pt. Photo affichée seulement si photo !== null.
async function panneau(nom, numero, photo) {
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
    const centreX = 1322 // centre de la colonne de droite

    // Avec photo : nom sous la photo. Sans photo : nom plus grand, remonté au centre de la zone.
    const tailleNom = taille_max(nom, ppregu, pngImage ? 90 : 120, 900)
    const yNom = pngImage ? 474 : 600
    const tailleNum = taille_max(numero, ppextra, 125, 980)

    for (const page of pages) {
        draw_Image(qrImage, page, 209, 407, 391, 391)
        if (pngImage) draw_Image(pngImage, page, 1173, 555, 298, 298)
        draw_Text(nom, page, centreX - ppregu.widthOfTextAtSize(nom, tailleNom) / 2, yNom, tailleNom, ppregu, marron, 0)
        draw_Text(numero, page, centreX - ppextra.widthOfTextAtSize(numero, tailleNum) / 2, 340, tailleNum, ppextra, marron, 0)
        if (rsacText) {
            draw_Text(rsacText, page, 1356 - ppregu.widthOfTextAtSize(rsacText, 15) / 2, 278, 15, ppregu, marron, 0)
        }
    }

    return await pdfDoc.save();
}

// Fonction pour réaliser la carte de visite
async function carte_de_visite(nom, mail, metier, numero, fichier, photo) {
    // Récupère le fichier
    const url = fichier;
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // Récupère les polices
    var lienfont = ppsansextra
    var fontBytes = await fetch(lienfont).then(res => res.arrayBuffer())
    pdfDoc.registerFontkit(fontkit)
    const ppextra = await pdfDoc.embedFont(fontBytes)

    var lienfont = ppsansregu
    var fontBytes = await fetch(lienfont).then(res => res.arrayBuffer())
    pdfDoc.registerFontkit(fontkit)
    const ppregu = await pdfDoc.embedFont(fontBytes)

    // Récupère les pages
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    var excedent = (nom.length - 11);
    excedent = (excedent < 0) ? 0 : excedent;
    var mail_excedent = mail.length > 35 ? Math.round((mail.length - 35) / 6) : 0;

    // Place le nom, le métier, le numéro et le mail
    draw_Text(nom, firstPage, 15, 136, 10 - (excedent / 11), ppextra, orange, 0);
    draw_Text(metier, firstPage, 15, 118, 10, ppregu, beige, 0);
    draw_Text(numero, firstPage, 15, 100, 8, ppregu, beige, 0);
    draw_Text(mail, firstPage, 15, 82, 8 - mail_excedent, ppregu, beige, 0);
    draw_Text("www.liberkeys.com", firstPage, 15, 64, 8, ppregu, orange, 0);

    // Récupère le RSAC
    const rsacText = get_RSAC();
    if (rsacText) {
        draw_Text(rsacText, firstPage, 15, 18, 3, ppregu, beige, 0);
    }

    // Récupère l'image
    if(photo != null) {
        var lienimage = photo;
        var pngImageBytes = await fetch(lienimage).then(res => res.arrayBuffer())
        var pngImage = await pdfDoc.embedPng(pngImageBytes)
        var pngDims = pngImage.scale(0.10)
    
        // Place l'image
        draw_Image(pngImage, firstPage, 167, 85, pngDims.width, pngDims.height)
    }

    // Récupère le lien
    var lien_agent = format_agent(nom);
    const qrCode = get_QRCode(lien_agent);
    pngImageBytes = await qrCode.getRawData("png").then(res => res.arrayBuffer())
    pngImage = await pdfDoc.embedPng(pngImageBytes)
    pngDims = pngImage.scale(0.18)

    // Place le QRCode
    draw_Image(pngImage, firstPage, 180, 28, pngDims.width, pngDims.height)

    const pdfBytes = await pdfDoc.save()

    // Enregistre le fichier
    return pdfBytes;
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
    const centre = width / 2

    // Phrase d'accroche (accordée selon un/une mandataire)
    draw_Text(phrase1, page, centre - lato.widthOfTextAtSize(phrase1, 13.3) / 2, 486.8, 13.3, lato, marron, 0)
    draw_Text(phrase2, page, centre - lato.widthOfTextAtSize(phrase2, 13.3) / 2, 468.8, 13.3, lato, marron, 0)

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
        draw_Text(l.texte, page, x, l.y, taille, l.police, l.couleur, 0)
    }

    // Photo ronde (avec sa bordure orange)
    if (photo !== null) {
        const pngImage = await pdfDoc.embedPng(await fetch(photo).then(res => res.arrayBuffer()))
        draw_Image(pngImage, page, 299.9, 356.9, 77.4, 77.4)
    }

    // QR code dans le carré blanc
    const qrImage = await pdfDoc.embedPng(await qr_to_png(format_agent(nom)))
    draw_Image(qrImage, page, 188.4, 119.7, 42.5, 42.5)

    // Mention légale (blanc, en bas)
    const rsac = get_RSAC()
    const mention = (rsac ? rsac + " - " : "") + "Ne pas jeter sur la voie publique"
    draw_Text(mention, page, centre - ppregu.widthOfTextAtSize(mention, 4) / 2, 54.1, 4, ppregu, rgb(1, 1, 1), 0)

    return await pdfDoc.save();
}
