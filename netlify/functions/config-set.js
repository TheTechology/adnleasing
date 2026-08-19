const { json } = require("./_lib/respond");
const { isAuthenticated } = require("./_lib/auth");
const { configStore } = require("./_lib/stores");

const ASSET_KEYS = ["auto", "flota", "echipamente", "imobiliar"];
const NUMERIC_ASSET_FIELDS = ["base", "spread", "price", "avans", "avansMax"];
const TEXT_ASSET_FIELDS = ["label", "hint", "priceLabel", "subject", "note"];

function validate(body) {
  if (!body || typeof body !== "object") return "Corp de cerere invalid.";
  if (!body.assets || typeof body.assets !== "object") return "Configurația «assets» lipsește.";

  for (const key of ASSET_KEYS) {
    const asset = body.assets[key];
    if (!asset || typeof asset !== "object") return "Lipsește configurația pentru „" + key + "”.";
    for (const field of NUMERIC_ASSET_FIELDS) {
      const v = asset[field];
      if (typeof v !== "number" || Number.isNaN(v) || v < 0) {
        return "Valoare numerică invalidă la „" + key + "." + field + "”.";
      }
    }
    for (const field of TEXT_ASSET_FIELDS) {
      if (typeof asset[field] !== "string" || !asset[field].trim()) {
        return "Text invalid/lipsă la „" + key + "." + field + "”.";
      }
    }
    if (!Array.isArray(asset.terms) || !asset.terms.length || asset.terms.some((t) => typeof t !== "number" || t <= 0)) {
      return "Perioadele (luni) sunt invalide pentru „" + key + "”.";
    }
    if (asset.avansMax < asset.avans) {
      return "Avansul maxim trebuie să fie ≥ avansul implicit pentru „" + key + "”.";
    }
  }

  if (!Array.isArray(body.structures) || !body.structures.length) return "Lista «structures» lipsește.";
  for (const st of body.structures) {
    if (!st || typeof st !== "object" || !st.id || !st.name) return "Fiecare structură are nevoie de id și nume.";
    if (typeof st.fee !== "number" || typeof st.residual !== "number" || typeof st.delta !== "number") {
      return "Valori numerice invalide în structura „" + (st.name || st.id) + "”.";
    }
    if (typeof st.chance !== "number" || st.chance < 0 || st.chance > 3) {
      return "«chance» trebuie să fie un număr între 0 și 3 (structura „" + (st.name || st.id) + "”).";
    }
  }

  return null;
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

  const error = validate(body);
  if (error) return json(400, { error });

  const config = {
    assets: body.assets,
    structures: body.structures,
    updatedAt: new Date().toISOString(),
  };
  await configStore().setJSON("simulator", config);
  return json(200, { ok: true, config });
};
