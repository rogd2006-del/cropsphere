import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './app';

describe('same-origin CORS', () => {
  it('allows the Vercel app origin without requiring CLIENT_URL to match', async () => {
    const origin = 'https://cropsphere-7b6o.vercel.app';
    const response = await request(app)
      .get('/not-found')
      .set('Host', 'cropsphere-7b6o.vercel.app')
      .set('Origin', origin)
      .set('X-Forwarded-Proto', 'https');

    expect(response.status).toBe(404);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('continues to reject unconfigured cross-origin requests', async () => {
    const response = await request(app)
      .get('/not-found')
      .set('Host', 'cropsphere-7b6o.vercel.app')
      .set('Origin', 'https://untrusted.example')
      .set('X-Forwarded-Proto', 'https');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
