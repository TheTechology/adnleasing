const { json } = require("./_lib/respond");
const { isAuthenticated } = require("./_lib/auth");
const { configStore } = require("./_lib/stores");
const DEFAULTS = require("./_lib/simulator-defaults");

exports.handler = async (event) => {
  if (!isAuthenticated(event)) return json(401, { error: "Neautorizat." });
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const config = {
    assets: DEFAULTS.ASSETS,
    structures: DEFAULTS.STRUCTURES,
    updatedAt: new Date().toISOString(),
  };
  await configStore().setJSON("simulator", config);
  return json(200, { ok: true, config });
};
