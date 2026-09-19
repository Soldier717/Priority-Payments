import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import handler from './api/site.js';

test('Vercel adapter serves the funnel, canonical URL, and honest contact fallback', async () => {
  const server = http.createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/site?route=`;
  try {
    const root = await fetch(base + '/', { redirect: 'manual' });
    assert.equal(root.status, 302);
    assert.equal(root.headers.get('location'), 'https://guidedpayments.com/home-page');
    for (const route of ['/home-page', '/zero-fee-inquiry', '/zero-fee-thank-you', '/privacy']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /https:\/\/guidedpayments.com/);
      if (route === '/zero-fee-inquiry' && (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM)) {
        assert.match(html, /mailto:sean@ppssfl.com/);
        assert.doesNotMatch(html, /<form id="lead-form"/);
      }
    }
    const invalid = await fetch(base + '/api/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    assert.equal(invalid.status, 400);
    const unknown = await fetch(base + '/not-a-page');
    assert.equal(unknown.status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
