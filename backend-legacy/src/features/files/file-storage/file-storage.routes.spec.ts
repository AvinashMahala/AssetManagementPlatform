import { RequestHandler } from 'express';
import { createFileStorageRoutes } from './api/file-storage.routes';

describe('File storage routes', () => {
  test('routes include GET / (list) and upload/download endpoints', () => {
    const mockAuth: RequestHandler = (req, res, next) => next();
    const router = createFileStorageRoutes({} as any, mockAuth as any) as any;

    const routes = router.stack
      .map((layer: any) => layer.route)
      .filter(Boolean)
      .map((r: any) => ({ path: r.path, methods: Object.keys(r.methods).sort() }));

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/', methods: expect.arrayContaining(['get']) }),
        expect.objectContaining({ path: '/upload', methods: expect.arrayContaining(['post']) }),
        expect.objectContaining({ path: '/:fileId/metadata', methods: expect.arrayContaining(['get']) }),
        expect.objectContaining({ path: '/:fileId/download', methods: expect.arrayContaining(['get']) }),
        expect.objectContaining({ path: '/:fileId', methods: expect.arrayContaining(['delete']) }),
      ])
    );
  });
});
