function json(statusCode, data, extraHeaders) {
  return {
    statusCode,
    headers: Object.assign(
      { "Content-Type": "application/json; charset=utf-8" },
      extraHeaders || {}
    ),
    body: JSON.stringify(data),
  };
}

module.exports = { json };
