const fetch = require('node-fetch');

async function fetchRemoteUrl(targetUrl) {
  const response = await fetch(targetUrl, { timeout: 5000 });
  const contentType = response.headers.get('content-type') || '';
  let body = await response.text();

  const maxLen = 4000;
  if (body.length > maxLen) {
    body = body.slice(0, maxLen) + '\n\n...[truncado]...';
  }

  return {
    status: response.status,
    statusText: response.statusText,
    contentType,
    body,
  };
}

module.exports = {
  fetchRemoteUrl,
};
