const crypto = require("crypto");
const { json } = require("./_lib/respond");
const { isAuthenticated } = require("./_lib/auth");
const { partnersStore } = require("./_lib/stores");

function clean(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 300);
}

exports.handler = async (event) => {
  if (!isAuthenticated(event)) return json(401, { error: "Neautorizat." });
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Cerere invalidă." });
  }
  if (!Array.isArray(body.partners)) return json(400, { error: "«partners» trebuie să fie o listă." });

  const partners = [];
  for (const p of body.partners) {
    if (!p || typeof p !== "object") return json(400, { error: "Fiecare partener trebuie să fie un obiect." });
    const name = clean(p.name, 120);
    if (!name) return json(400, { error: "Fiecare partener are nevoie de un nume." });
    partners.push({
      id: clean(p.id, 60) || crypto.randomUUID(),
      name,
      logo: clean(p.logo, 500),
      website: clean(p.website, 300),
      visible: p.visible !== false,
    });
  }

  await partnersStore().setJSON("list", partners);
  return json(200, { ok: true, partners });
};
