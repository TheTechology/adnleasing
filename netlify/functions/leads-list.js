const { json } = require("./_lib/respond");
const { isAuthenticated } = require("./_lib/auth");
const { leadsStore } = require("./_lib/stores");

exports.handler = async (event) => {
  if (!isAuthenticated(event)) return json(401, { error: "Neautorizat." });

  const store = leadsStore();
  const { blobs } = await store.list();
  const leads = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  const clean = leads.filter(Boolean);
  clean.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  return json(200, { leads: clean });
};
