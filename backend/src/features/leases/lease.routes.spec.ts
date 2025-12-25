import { RequestHandler } from 'express';
import { createLeaseRoutes } from './api/lease.routes';

describe('Lease routes', () => {
  test('createLeaseRoutes returns a router with expected endpoints', () => {
    const mockAuth: RequestHandler = (req, res, next) => next();
    const router = createLeaseRoutes(mockAuth as any) as any;

    // Express Router exposes stack with route layers
    const routes = router.stack
      .map((layer: any) => layer.route)
      .filter(Boolean)
      .map((r: any) => ({ path: r.path, methods: Object.keys(r.methods).sort() }));

    const expected = [
      { path: '/', methods: ['post', 'get'] },
      { path: '/:id', methods: ['get', 'put'] },
      { path: '/:id/terminate', methods: ['post'] },
    ];

    expected.forEach((exp) => {
      expect(routes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: exp.path, methods: expect.arrayContaining(exp.methods) }),
        ])
      );
    });
  });
});
