/* Trebuie să rămână în sincron cu constantele ASSETS/STRUCTURES din Simulator.html —
   acelea sunt fallback-ul folosit când site-ul rulează fără backend (ex. cPanel static). */

const ASSETS = {
  auto: {
    label: "Autoturism",
    hint: "nou sau rulat, firmă ori persoană fizică",
    base: 4.55,
    spread: 1.75,
    terms: [12, 24, 36, 48, 60],
    price: 25000,
    avans: 15,
    avansMax: 50,
    priceLabel: "Preț fără TVA",
    subject: "leasing auto",
    note: "Ce mașină vrei? Marcă, model, an",
  },
  flota: {
    label: "Flotă auto",
    hint: "leasing operațional, servicii incluse",
    base: 5.5,
    spread: 2.0,
    terms: [24, 36, 48, 60],
    price: 30000,
    avans: 0,
    avansMax: 30,
    priceLabel: "Valoare vehicul fără TVA",
    subject: "leasing operațional",
    note: "Câte vehicule și ce rulaj anual",
  },
  echipamente: {
    label: "Echipamente",
    hint: "utilaje, medical, IT, construcții",
    base: 5.2,
    spread: 2.3,
    terms: [12, 24, 36, 48, 60],
    price: 45000,
    avans: 20,
    avansMax: 50,
    priceLabel: "Valoare echipament fără TVA",
    subject: "leasing echipamente",
    note: "Ce echipament și de la ce furnizor",
  },
  imobiliar: {
    label: "Imobil comercial",
    hint: "sediu, hală, spațiu comercial",
    base: 5.5,
    spread: 1.5,
    terms: [60, 84, 96, 120, 144],
    price: 250000,
    avans: 25,
    avansMax: 50,
    priceLabel: "Valoare imobil fără TVA",
    subject: "leasing imobiliar",
    note: "Ce imobil, ce suprafață și unde",
  },
};

const STRUCTURES = [
  { id: "fix", name: "Dobândă fixă", type: "Financiar", fee: 0.5, residual: 0, delta: 0, chance: 3, fit: "Predictibilitate pe toată durata", note: "Rată constantă, fără recalculări." },
  { id: "var", name: "Dobândă variabilă", type: "Financiar", fee: 0.4, residual: 0, delta: -0.25, chance: 3, fit: "Toleranță la variații de indice", note: "Se recalculează trimestrial, după IRCC." },
  { id: "rezid", name: "Cu valoare reziduală", type: "Financiar", fee: 0.3, residual: 0.2, delta: 0.35, chance: 2, fit: "Rată lunară minimă", note: "Reziduală 20% plătită la final." },
  { id: "flex", name: "Grafic flexibil", type: "Financiar", fee: 0.35, residual: 0.1, delta: 0.5, chance: 2, fit: "Încasări sezoniere", note: "Graficul se ajustează o dată pe an." },
  { id: "full", name: "Full service", type: "Operațional", fee: 0.25, residual: 0, delta: 0.95, chance: 3, fit: "Flote și utilizare intensă", note: "Asigurări și mentenanță incluse în rată." },
  { id: "zero", name: "Fără comision de analiză", type: "Financiar", fee: 0, residual: 0, delta: 0.75, chance: 3, fit: "Cash minim la semnare", note: "Zero costuri inițiale, dobândă mai mare." },
  { id: "rapid", name: "Aprobare rapidă", type: "Financiar", fee: 0.6, residual: 0, delta: 1.1, chance: 3, fit: "Termen scurt de livrare", note: "Analiză prioritară, documentație redusă." },
];

module.exports = { ASSETS, STRUCTURES };
