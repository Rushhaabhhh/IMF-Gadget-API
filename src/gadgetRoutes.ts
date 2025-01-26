import express from 'express';
import { GadgetController } from './gadgetController';
import { authenticateJWT } from './libs/middleware';

const router = express.Router();

router.get('/', GadgetController.getAllGadgets);
router.post('/', GadgetController.addGadget);
router.post('/:id/self-destruct', authenticateJWT, GadgetController.selfDestruct);

export default router;