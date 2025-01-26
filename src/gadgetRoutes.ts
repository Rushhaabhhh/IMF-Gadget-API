import express, { Request, Response, NextFunction } from 'express';
import { 
  getGadgets, 
  addGadget, 
  decommissionGadget, 
  triggerSelfDestruct 
} from './gadgetController';
import { authenticateToken } from './libs/middleware';

const router = express.Router();

// Wrap middleware to handle async routes
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get('/gadgets', asyncHandler(getGadgets));
router.post('/gadgets', asyncHandler(addGadget));
router.delete('/gadgets/:id', asyncHandler(decommissionGadget));
router.post('/gadgets/:id/self-destruct', asyncHandler(triggerSelfDestruct));

export default router;