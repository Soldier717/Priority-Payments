import worker from '../worker.mjs';

export default async function handler(req, res) {
  const incoming = new URL(req.url, 'https://guidedpayments.com');
  const path = incoming.searchParams.get('route') || incoming.pathname;
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  let body;
  if (!['GET', 'HEAD'].includes(req.method)) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > (['/api/boarding/upload','/api/statement/upload'].includes(path)?4300000:12000)) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Your message is too long.' }));
        return;
      }
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks);
  }
  const host = req.headers.host || 'guidedpayments.com';
  const protocol = host.startsWith('127.0.0.1:') || host.startsWith('localhost:') ? 'http' : 'https';
  const requestUrl=new URL(path, `${protocol}://${host}`);
  const query=new URLSearchParams(incoming.search);query.delete('route');requestUrl.search=query.toString();
  const request = new Request(requestUrl, {
    method: req.method, headers, body,
  });
  const response = await worker.fetch(request, process.env);
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}
