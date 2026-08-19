const { json } = require("./_lib/respond");
const { isAuthenticated } = require("./_lib/auth");
const { leadsStore } = require("./_lib/stores");

const STATUSES = ["nou", "contactat", "in_analiza", "aprobat", "respins", "castigat", "pierdut"];

exports.handler = async (event) => {
  if (!isAuthenticated(event)) return json(401, { error: "Neautorizat." });
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Cerere invalidă." });
  }
  if (!body.id) return json(400, { error: "id obligatoriu." });

  const store = leadsStore();
  const lead = await store.get(body.id, { type: "json" });
  if (!lead) return json(404, { error: "Cererea nu a fost găsită." });

  if (body.status && STATUSES.indexOf(body.status) !== -1) lead.status = body.status;
  if (typeof body.assignedTo === "string") lead.assignedTo = body.assignedTo.trim().slice(0, 120);
  if (body.note && String(body.note).trim()) {
    lead.notes = Array.isArray(lead.notes) ? lead.notes : [];
    lead.notes.push({ at: new Date().toISOString(), text: String(body.note).trim().slice(0, 2000) });
  }
  lead.updatedAt = new Date().toISOString();

  await store.setJSON(body.id, lead);
  return json(200, { ok: true, lead });
};
