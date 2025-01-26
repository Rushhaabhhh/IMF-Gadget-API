import express from 'express';
import { GadgetController } from './gadgetController';
import { authenticateJWT } from './libs/middleware';

const router = express.Router();

// router.get('/', GadgetController.getAllGadgets);
// router.get('/:id', authenticateJWT, GadgetController.getGadgetById);
// router.post('/', authenticateJWT, GadgetController.addGadget);
// router.patch('/:id', authenticateJWT, GadgetController.updateGadget);
// router.delete('/:id', authenticateJWT, GadgetController.decommissionGadget);
// router.post('/:id/self-destruct', authenticateJWT, GadgetController.selfDestruct);

router.get('/', GadgetController.getAllGadgets);
router.get('/:id',  GadgetController.getGadgetById);
router.post('/', GadgetController.addGadget);
router.patch('/:id', GadgetController.updateGadget);
router.delete('/:id', GadgetController.decommissionGadget);
router.post('/:id/self-destruct', GadgetController.selfDestruct);
router.get('/', GadgetController.getGadgetsByStatus);



export default router;