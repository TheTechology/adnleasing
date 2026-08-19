const { json } = require("./_lib/respond");
const { partnersStore } = require("./_lib/stores");

exports.handler = async () => {
  const stored = await partnersStore().get("list", { type: "json" });
  return json(200, { partners: Array.isArray(stored) ? stored : [] }, { "Cache-Control": "no-store" });
};
