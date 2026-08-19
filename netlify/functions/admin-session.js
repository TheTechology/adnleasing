const { json } = require("./_lib/respond");
const { isAuthenticated } = require("./_lib/auth");

exports.handler = async (event) => json(200, { authenticated: isAuthenticated(event) });
