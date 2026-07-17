import type { Language } from "../types";

export type Locale = "de" | "en" | "fr" | "it";
export const LOCALES: Locale[] = ["de", "en", "fr", "it"];
export const DEFAULT_LOCALE: Locale = "de";

export function localeToLanguage(l: Locale): Language {
  return l.toUpperCase() as Language;
}

export interface Strings {
  // chrome
  searchPh: string; account: string; cart: string; allProducts: string; home: string; shop: string;
  // home
  shopNow: string;
  promoTag: string; categories: string; viewAll: string; featured: string;
  // catalog
  sortBy: string; sortPop: string; sortPriceUp: string; sortPriceDown: string; sortNew: string;
  inStock: string; limited: string; unavail: string; product: string; results: string; noResults: string;
  // product
  variation: string; extras: string; qty: string; addToCart: string; total: string;
  delivery: string; pickup: string; digital: string; reservation: string;
  inclusive: string; required: string; soldOut: string;
  description: string; buyNow: string; recommended: string;
  socialShare: string; deliveryTerms: string; info: string; linkCopied: string;
  // cart
  cartTitle: string; unit: string; remove: string; subtotal: string; discount: string;
  shipping: string; freeShip: string; surcharge: string; grand: string; checkout: string;
  emptyCart: string; backToShop: string; continueShopping: string;
  taxIncl: string; taxExcl: string;
  // checkout
  contact: string; firstName: string; lastName: string; email: string; phone: string;
  fulfillment: string; addr: string; street: string; streetNumber: string; zip: string; city: string; country: string; notesLabel: string;
  standard: string; premium: string; freeUnlocked: string; pickupLabel: string;
  payTitle: string; placeOrder: string; termsLbl: string; addMoreForFree: string;
  // success
  successTitle: string; successText: string; orderRef: string; payInstr: string; nextSteps: string; payOrder: string;
  step1: string; step2: string;
  // order lookup
  trackTitle: string; trackIntro: string; sendCode: string; codeLabel: string; codeSent: string; openOrder: string; orderStatus: string; paymentStatus: string; orderNotFound: string;
  // account
  myAccount: string; orders: string; profile: string; addresses: string; logout: string; orderHist: string;
  // footer / misc
  footerTerms: string; contactInfo: string;
  notFoundTitle: string; notFoundText: string;
}

const de: Strings = {
  searchPh: "Suche nach Produkten, Vendoren …", account: "Konto", cart: "Warenkorb", allProducts: "Alle Produkte", home: "Home", shop: "Shop",
  shopNow: "Jetzt einkaufen",
  promoTag: "AKTION", categories: "Kategorien", viewAll: "Alle ansehen", featured: "Ausgewählte Angebote",
  sortBy: "Sortieren", sortPop: "Beliebtheit", sortPriceUp: "Preis aufsteigend", sortPriceDown: "Preis absteigend", sortNew: "Neuheiten",
  inStock: "An Lager", limited: "Wenige übrig", unavail: "Nicht verfügbar", product: "Produkt", results: "Produkte", noResults: "Keine Produkte gefunden.",
  variation: "Variante", extras: "Extras", qty: "Menge", addToCart: "In den Warenkorb", total: "Total",
  delivery: "Lieferung", pickup: "Abholung", digital: "Digital", reservation: "Reservation",
  inclusive: "inklusive", required: "Erforderlich", soldOut: "Ausverkauft",
  description: "Beschreibung", buyNow: "Jetzt kaufen", recommended: "Empfohlene Produkte",
  socialShare: "Teilen:", deliveryTerms: "Liefer- & Vertragsbedingungen", info: "Hinweise", linkCopied: "Link kopiert",
  cartTitle: "Warenkorb", unit: "Stück", remove: "Entfernen", subtotal: "Zwischensumme", discount: "Rabatt",
  shipping: "Lieferung", freeShip: "Gratis", surcharge: "Kleinmengen-Zuschlag", grand: "Gesamttotal", checkout: "Zur Kasse",
  emptyCart: "Dein Warenkorb ist leer", backToShop: "Zurück zum Shop", continueShopping: "Weiter einkaufen",
  taxIncl: "inkl. {rate} % MwSt", taxExcl: "zzgl. {rate} % MwSt",
  contact: "Kontaktangaben", firstName: "Vorname", lastName: "Nachname", email: "E-Mail", phone: "Telefon (für Lieferung)",
  fulfillment: "Versandart", addr: "Adresse", street: "Strasse", streetNumber: "Nr.", zip: "PLZ", city: "Ort", country: "Land", notesLabel: "Anmerkungen",
  standard: "Standard", premium: "Premium", freeUnlocked: "Gratis-Lieferung freigeschaltet", pickupLabel: "Abholung",
  payTitle: "Zahlungsart", placeOrder: "Bestellung abschliessen", termsLbl: "Ich akzeptiere die AGB und Datenschutzerklärung", addMoreForFree: "Noch {amount} bis zur Gratis-Lieferung",
  successTitle: "Vielen Dank für deine Bestellung!", successText: "Eine Bestätigung wurde an deine E-Mail-Adresse gesendet. Wir informieren dich, sobald deine Bestellung versandt wird.", orderRef: "Bestellnummer", payInstr: "Zahlungshinweise", nextSteps: "Nächste Schritte", payOrder: "Bestellung ansehen & bezahlen",
  step1: "Bestellung wird kommissioniert", step2: "Versand / Bereitstellung zur Abholung",
  trackTitle: "Bestellung ansehen", trackIntro: "Gib deine Bestellnummer und E-Mail-Adresse ein. Wir senden dir einen Zugangscode.", sendCode: "Code senden", codeLabel: "Zugangscode", codeSent: "Wir haben einen Code an deine E-Mail gesendet.", openOrder: "Bestellung öffnen", orderStatus: "Bestellstatus", paymentStatus: "Zahlungsstatus", orderNotFound: "Bestellung nicht gefunden oder Code ungültig.",
  myAccount: "Mein Konto", orders: "Bestellungen", profile: "Profil", addresses: "Adressen", logout: "Abmelden", orderHist: "Bestellverlauf",
  footerTerms: "AGB", contactInfo: "Kontaktangaben",
  notFoundTitle: "Seite nicht gefunden", notFoundText: "Diese Seite existiert nicht oder wurde verschoben.",
};

const en: Strings = {
  searchPh: "Search products, vendors …", account: "Account", cart: "Cart", allProducts: "All products", home: "Home", shop: "Shop",
  shopNow: "Shop now",
  promoTag: "OFFER", categories: "Categories", viewAll: "View all", featured: "Featured offers",
  sortBy: "Sort", sortPop: "Popularity", sortPriceUp: "Price: low to high", sortPriceDown: "Price: high to low", sortNew: "Newest",
  inStock: "In stock", limited: "Few left", unavail: "Unavailable", product: "product", results: "products", noResults: "No products found.",
  variation: "Variation", extras: "Extras", qty: "Quantity", addToCart: "Add to cart", total: "Total",
  delivery: "Delivery", pickup: "Pickup", digital: "Digital", reservation: "Reservation",
  inclusive: "included", required: "Required", soldOut: "Sold out",
  description: "Description", buyNow: "Buy Now", recommended: "Recommended Products",
  socialShare: "Social Share:", deliveryTerms: "Delivery Terms & Condition", info: "Information", linkCopied: "Link copied",
  cartTitle: "Shopping cart", unit: "unit", remove: "Remove", subtotal: "Subtotal", discount: "Discount",
  shipping: "Delivery", freeShip: "Free", surcharge: "Small-order surcharge", grand: "Grand total", checkout: "Checkout",
  emptyCart: "Your cart is empty", backToShop: "Back to shop", continueShopping: "Continue shopping",
  taxIncl: "incl. {rate}% VAT", taxExcl: "plus {rate}% VAT",
  contact: "Contact details", firstName: "First name", lastName: "Last name", email: "Email", phone: "Phone (for delivery)",
  fulfillment: "Fulfillment", addr: "Address", street: "Street", streetNumber: "No.", zip: "ZIP", city: "City", country: "Country", notesLabel: "Notes",
  standard: "Standard", premium: "Premium", freeUnlocked: "Free delivery unlocked", pickupLabel: "Pickup",
  payTitle: "Payment method", placeOrder: "Place order", termsLbl: "I accept the terms & privacy policy", addMoreForFree: "{amount} more for free delivery",
  successTitle: "Thank you for your order!", successText: "A confirmation has been sent to your email address. We'll let you know as soon as your order ships.", orderRef: "Order number", payInstr: "Payment instructions", nextSteps: "Next steps", payOrder: "View & pay order",
  step1: "Order is being picked", step2: "Shipping / ready for pickup",
  trackTitle: "View your order", trackIntro: "Enter your order number and email address. We'll send you an access code.", sendCode: "Send code", codeLabel: "Access code", codeSent: "We've sent a code to your email.", openOrder: "Open order", orderStatus: "Order status", paymentStatus: "Payment status", orderNotFound: "Order not found or code invalid.",
  myAccount: "My account", orders: "Orders", profile: "Profile", addresses: "Addresses", logout: "Log out", orderHist: "Order history",
  footerTerms: "Terms", contactInfo: "Contact",
  notFoundTitle: "Page not found", notFoundText: "This page does not exist or has moved.",
};

const fr: Strings = {
  searchPh: "Rechercher produits, producteurs …", account: "Compte", cart: "Panier", allProducts: "Tous les produits", home: "Accueil", shop: "Boutique",
  shopNow: "Acheter",
  promoTag: "OFFRE", categories: "Catégories", viewAll: "Voir tout", featured: "Offres sélectionnées",
  sortBy: "Trier", sortPop: "Popularité", sortPriceUp: "Prix croissant", sortPriceDown: "Prix décroissant", sortNew: "Nouveautés",
  inStock: "En stock", limited: "Bientôt épuisé", unavail: "Indisponible", product: "produit", results: "produits", noResults: "Aucun produit trouvé.",
  variation: "Variante", extras: "Extras", qty: "Quantité", addToCart: "Ajouter au panier", total: "Total",
  delivery: "Livraison", pickup: "Retrait", digital: "Numérique", reservation: "Réservation",
  inclusive: "inclus", required: "Obligatoire", soldOut: "Épuisé",
  description: "Description", buyNow: "Acheter maintenant", recommended: "Produits recommandés",
  socialShare: "Partager :", deliveryTerms: "Livraison & CGV", info: "Informations", linkCopied: "Lien copié",
  cartTitle: "Panier", unit: "unité", remove: "Retirer", subtotal: "Sous-total", discount: "Remise",
  shipping: "Livraison", freeShip: "Gratuit", surcharge: "Supplément petite commande", grand: "Total", checkout: "Commander",
  emptyCart: "Votre panier est vide", backToShop: "Retour à la boutique", continueShopping: "Continuer",
  taxIncl: "TVA {rate} % incl.", taxExcl: "TVA {rate} % en sus",
  contact: "Coordonnées", firstName: "Prénom", lastName: "Nom", email: "E-mail", phone: "Téléphone (pour la livraison)",
  fulfillment: "Mode de réception", addr: "Adresse", street: "Rue", streetNumber: "N°", zip: "NPA", city: "Localité", country: "Pays", notesLabel: "Remarques",
  standard: "Standard", premium: "Premium", freeUnlocked: "Livraison gratuite débloquée", pickupLabel: "Retrait",
  payTitle: "Paiement", placeOrder: "Passer commande", termsLbl: "J'accepte les CGV et la politique de confidentialité", addMoreForFree: "Encore {amount} pour la livraison gratuite",
  successTitle: "Merci pour votre commande !", successText: "Une confirmation a été envoyée à votre adresse e-mail. Nous vous informerons dès l'expédition.", orderRef: "Numéro de commande", payInstr: "Instructions de paiement", nextSteps: "Prochaines étapes", payOrder: "Voir & payer la commande",
  step1: "Commande en préparation", step2: "Expédition / prête au retrait",
  trackTitle: "Voir votre commande", trackIntro: "Saisissez votre numéro de commande et votre e-mail. Nous vous enverrons un code d'accès.", sendCode: "Envoyer le code", codeLabel: "Code d'accès", codeSent: "Nous avons envoyé un code à votre e-mail.", openOrder: "Ouvrir la commande", orderStatus: "Statut de la commande", paymentStatus: "Statut du paiement", orderNotFound: "Commande introuvable ou code invalide.",
  myAccount: "Mon compte", orders: "Commandes", profile: "Profil", addresses: "Adresses", logout: "Déconnexion", orderHist: "Historique",
  footerTerms: "CGV", contactInfo: "Contact",
  notFoundTitle: "Page introuvable", notFoundText: "Cette page n'existe pas ou a été déplacée.",
};

const it: Strings = {
  searchPh: "Cerca prodotti, produttori …", account: "Account", cart: "Carrello", allProducts: "Tutti i prodotti", home: "Home", shop: "Negozio",
  shopNow: "Acquista",
  promoTag: "OFFERTA", categories: "Categorie", viewAll: "Vedi tutto", featured: "Offerte in evidenza",
  sortBy: "Ordina", sortPop: "Popolarità", sortPriceUp: "Prezzo crescente", sortPriceDown: "Prezzo decrescente", sortNew: "Novità",
  inStock: "Disponibile", limited: "Ultimi pezzi", unavail: "Non disponibile", product: "prodotto", results: "prodotti", noResults: "Nessun prodotto trovato.",
  variation: "Variante", extras: "Extra", qty: "Quantità", addToCart: "Aggiungi al carrello", total: "Totale",
  delivery: "Consegna", pickup: "Ritiro", digital: "Digitale", reservation: "Prenotazione",
  inclusive: "incluso", required: "Obbligatorio", soldOut: "Esaurito",
  description: "Descrizione", buyNow: "Compra ora", recommended: "Prodotti consigliati",
  socialShare: "Condividi:", deliveryTerms: "Consegna & Termini", info: "Informazioni", linkCopied: "Link copiato",
  cartTitle: "Carrello", unit: "unità", remove: "Rimuovi", subtotal: "Subtotale", discount: "Sconto",
  shipping: "Consegna", freeShip: "Gratis", surcharge: "Supplemento piccoli ordini", grand: "Totale", checkout: "Cassa",
  emptyCart: "Il carrello è vuoto", backToShop: "Torna al negozio", continueShopping: "Continua",
  taxIncl: "IVA {rate} % incl.", taxExcl: "IVA {rate} % escl.",
  contact: "Contatti", firstName: "Nome", lastName: "Cognome", email: "E-mail", phone: "Telefono (per la consegna)",
  fulfillment: "Modalità", addr: "Indirizzo", street: "Via", streetNumber: "N.", zip: "CAP", city: "Località", country: "Paese", notesLabel: "Note",
  standard: "Standard", premium: "Premium", freeUnlocked: "Consegna gratuita sbloccata", pickupLabel: "Ritiro",
  payTitle: "Pagamento", placeOrder: "Ordina", termsLbl: "Accetto termini e privacy", addMoreForFree: "Ancora {amount} per la consegna gratuita",
  successTitle: "Grazie per il tuo ordine!", successText: "Una conferma è stata inviata al tuo indirizzo e-mail. Ti avviseremo appena l'ordine viene spedito.", orderRef: "Numero ordine", payInstr: "Istruzioni di pagamento", nextSteps: "Prossimi passi", payOrder: "Vedi e paga l'ordine",
  step1: "Ordine in preparazione", step2: "Spedizione / pronto per il ritiro",
  trackTitle: "Vedi il tuo ordine", trackIntro: "Inserisci il numero dell'ordine e l'e-mail. Ti invieremo un codice di accesso.", sendCode: "Invia codice", codeLabel: "Codice di accesso", codeSent: "Abbiamo inviato un codice alla tua e-mail.", openOrder: "Apri ordine", orderStatus: "Stato ordine", paymentStatus: "Stato pagamento", orderNotFound: "Ordine non trovato o codice non valido.",
  myAccount: "Il mio account", orders: "Ordini", profile: "Profilo", addresses: "Indirizzi", logout: "Esci", orderHist: "Storico ordini",
  footerTerms: "Termini", contactInfo: "Contatti",
  notFoundTitle: "Pagina non trovata", notFoundText: "Questa pagina non esiste o è stata spostata.",
};

export const STRINGS: Record<Locale, Strings> = { de, en, fr, it };

export function getStrings(locale: Locale): Strings {
  return STRINGS[locale] ?? STRINGS[DEFAULT_LOCALE];
}
