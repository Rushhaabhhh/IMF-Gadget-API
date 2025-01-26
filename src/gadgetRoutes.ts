import express from 'express';
import { GadgetController } from './gadgetController';
import { authenticateJWT } from './libs/middleware';

const router = express.Router();

router.post('/', GadgetController.addGadget);

router.get('/', GadgetController.getAllGadgets);
router.get('/:id', authenticateJWT, GadgetController.getGadgetById);

router.patch('/:id', authenticateJWT, GadgetController.updateGadget);
router.delete('/:id', authenticateJWT, GadgetController.decommissionGadget);

router.post('/:id/self-destruct', authenticateJWT, GadgetController.selfDestruct);

export default router;