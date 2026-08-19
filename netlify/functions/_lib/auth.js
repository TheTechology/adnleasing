const crypto = require("crypto");

const COOKIE_NAME = "adn_admin_session";
const SESSION_HOURS = 12;

function isLocalDev() {
  return process.env.NETLIFY_DEV === "true";
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET nu este configurat pe server.");
  return secret;
}

function sign(payload) {
  const secret = getSecret();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + sig;
}

function verify(token) {
  if (!token || token.indexOf(".") === -1) return null;
  const parts = token.split(".");
  const body = parts[0];
  const sig = parts[1];
  let expected;
  try {
    expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  } catch (e) {
    return null;
  }
  const a = Buffer.from(sig || "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function cookieBaseFlags() {
  return isLocalDev() ? "Path=/; HttpOnly; SameSite=Lax" : "Path=/; HttpOnly; Secure; SameSite=Lax";
}

function makeSessionCookie() {
  const token = sign({ role: "admin", exp: Date.now() + SESSION_HOURS * 3600 * 1000 });
  return COOKIE_NAME + "=" + token + "; " + cookieBaseFlags() + "; Max-Age=" + SESSION_HOURS * 3600;
}

function clearSessionCookie() {
  return COOKIE_NAME + "=; " + cookieBaseFlags() + "; Max-Age=0";
}

function readCookie(event) {
  const header = (event.headers && (event.headers.cookie || event.headers.Cookie)) || "";
  const found = header.split(";").map((s) => s.trim()).find((s) => s.indexOf(COOKIE_NAME + "=") === 0);
  return found ? found.slice(COOKIE_NAME.length + 1) : null;
}

function isAuthenticated(event) {
  const token = readCookie(event);
  if (!token) return false;
  return !!verify(token);
}

module.exports = {
  COOKIE_NAME,
  makeSessionCookie,
  clearSessionCookie,
  isAuthenticated,
};
