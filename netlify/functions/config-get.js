const { json } = require("./_lib/respond");
const { configStore } = require("./_lib/stores");
const DEFAULTS = require("./_lib/simulator-defaults");

exports.handler = async () => {
  const stored = await configStore().get("simulator", { type: "json" });
  const config = stored || {
    assets: DEFAULTS.ASSETS,
    structures: DEFAULTS.STRUCTURES,
    updatedAt: null,
  };
  return json(200, config, { "Cache-Control": "no-store" });
};
