import { Router } from 'express';
import { AssetController } from '../controllers/assetController';

export const createAssetRoutes = (controller: AssetController) => {
  const router = Router();

  router.get('/', controller.getAll.bind(controller));
  router.post('/', controller.create.bind(controller));

  return router;
};