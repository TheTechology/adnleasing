const { json } = require("./_lib/respond");
const { isAuthenticated } = require("./_lib/auth");
const { leadsStore } = require("./_lib/stores");

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

  await leadsStore().delete(body.id);
  return json(200, { ok: true });
};
