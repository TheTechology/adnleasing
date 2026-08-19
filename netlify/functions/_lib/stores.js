const { getStore } = require("@netlify/blobs");

/*
 * Pe Netlify (după deploy) contextul Blobs este injectat automat — getStore()
 * funcționează direct, fără nicio configurare. Local, `netlify dev` oferă
 * emulare Blobs doar pentru proiecte legate de un site real (`netlify link`),
 * ceea ce nu e cazul înainte de primul deploy. Fallback-ul de mai jos e activ
 * STRICT în `netlify dev` fără sesiune Blobs — scrie în fișiere locale sub
 * .netlify/local-blobs/, exclusiv pentru testare pe această maşină. Pe
 * Netlify real, NETLIFY_BLOBS_CONTEXT există mereu şi acest fallback nu se
 * activează niciodată.
 */
const fs = require("fs");
const path = require("path");

function blobsContextMissing() {
  const ctx = process.env.NETLIFY_BLOBS_CONTEXT;
  return !ctx || ctx === "undefined";
}

function localFallbackActive() {
  return process.env.NETLIFY_DEV === "true" && blobsContextMissing();
}

function localDir(name) {
  const dir = path.join(process.cwd(), ".netlify", "local-blobs", name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function keyToFile(dir, key) {
  const safe = Buffer.from(key).toString("base64url");
  return path.join(dir, safe + ".json");
}

function localStore(name) {
  const dir = localDir(name);
  return {
    async get(key, opts) {
      const file = keyToFile(dir, key);
      if (!fs.existsSync(file)) return null;
      const raw = fs.readFileSync(file, "utf8");
      return opts && opts.type === "json" ? JSON.parse(raw) : raw;
    },
    async setJSON(key, value) {
      fs.writeFileSync(keyToFile(dir, key), JSON.stringify(value));
    },
    async delete(key) {
      const file = keyToFile(dir, key);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    },
    async list() {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
      return {
        blobs: files.map((f) => ({
          key: Buffer.from(f.replace(/\.json$/, ""), "base64url").toString("utf8"),
        })),
      };
    },
  };
}

function pickStore(name) {
  return localFallbackActive() ? localStore(name) : getStore(name);
}

function leadsStore() {
  return pickStore("adn-leads");
}

function configStore() {
  return pickStore("adn-config");
}

function partnersStore() {
  return pickStore("adn-partners");
}

module.exports = { leadsStore, configStore, partnersStore };
