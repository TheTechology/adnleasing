const { json } = require("./_lib/respond");
const { makeSessionCookie } = require("./_lib/auth");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Cerere invalidă." });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return json(500, { error: "ADMIN_PASSWORD nu este configurat pe server (variabilă de mediu Netlify)." });
  }
  if (!body.password || body.password !== expected) {
    return json(401, { error: "Parolă incorectă." });
  }

  let cookie;
  try {
    cookie = makeSessionCookie();
  } catch (e) {
    return json(500, { error: e.message });
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": cookie,
    },
    body: JSON.stringify({ ok: true }),
  };
};
