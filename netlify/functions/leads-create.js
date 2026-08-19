const crypto = require("crypto");
const { json } = require("./_lib/respond");
const { leadsStore } = require("./_lib/stores");

function clean(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max || 500);
}

function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Cerere invalidă." });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 9) {
    return json(400, { error: "Numele și telefonul valide sunt obligatorii." });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const dossierCode = clean(body.dossierCode, 40) || ("ADN-" + Math.floor(100000 + Math.random() * 899999));

  const lead = {
    id,
    createdAt: now,
    updatedAt: now,
    status: "nou",
    source: clean(body.source, 40) || "necunoscut",
    page: clean(body.page, 200),
    name,
    phone,
    email: clean(body.email, 160),
    message: clean(body.message, 2000),
    asset: clean(body.asset, 40),
    assetLabel: clean(body.assetLabel, 80),
    price: num(body.price),
    avansPct: num(body.avansPct),
    months: num(body.months),
    structureName: clean(body.structureName, 120),
    monthlyEstimate: num(body.monthlyEstimate),
    totalEstimate: num(body.totalEstimate),
    profile: clean(body.profile, 80),
    dossierCode,
    notes: [],
    assignedTo: "",
  };

  await leadsStore().setJSON(id, lead);
  return json(200, { ok: true, id, dossierCode });
};
