import { Request, Response } from 'express';
import { Gadget, GadgetStatus } from './gadgetModel';
import { generateCodename, generateMissionProbability } from './libs/helper';
import redisClient from './libs/redis';

export class GadgetController {
  // Cache key generator
  private static getCacheKey(key: string, value?: string): string {
    return value ? `gadget:${key}:${value}` : `gadget:${key}`;
  }

  // Get all gadgets with mission success probability and caching
  static async getAllGadgets(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const cacheKey = GadgetController.getCacheKey('all', status as string);
      
      // Check Redis cache first
      const cachedGadgets = await redisClient.get(cacheKey);
      if (cachedGadgets) {
        res.json(JSON.parse(cachedGadgets));
        return;
      }

      const whereClause = status ? { status: status as GadgetStatus } : {};
      const gadgets = await Gadget.findAll({ where: whereClause });
      
      // Cache results for 1 hour
      await redisClient.set(cacheKey, JSON.stringify(gadgets), 'EX', 3600);
      
      res.json(gadgets);
    } catch (error) {
      console.error('Error retrieving gadgets:', error);
      res.status(500).json({ error: 'Failed to retrieve gadgets' });
    }
  }

  // Get gadget by ID with caching
  static async getGadgetById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cacheKey = GadgetController.getCacheKey('id', id);
      
      // Check Redis cache first
      const cachedGadget = await redisClient.get(cacheKey);
      if (cachedGadget) {
        res.json(JSON.parse(cachedGadget));
        return;
      }

      const gadget = await Gadget.findByPk(id);

      if (!gadget) {
        res.status(404).json({ error: 'Gadget not found' });
        return;
      }

      // Cache results for 1 hour
      await redisClient.set(cacheKey, JSON.stringify(gadget), 'EX', 3600);
      
      res.json(gadget);
    } catch (error) {
      console.error('Error retrieving gadget:', error);
      res.status(500).json({ error: 'Failed to retrieve gadget' });
    }
  }

  // Add a new gadget with cache invalidation
  public static async addGadget(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name?.trim()) {
        res.status(400).json({ error: 'Gadget name is required' });
        return;
      }

      const codename = generateCodename();
      const existingGadget = await Gadget.findOne({ where: { codename } });

      if (existingGadget) {
        res.status(409).json({ error: 'Duplicate codename generated' });
        return;
      }

      const newGadget = await Gadget.create({
        name: name.trim(),
        codename,
        status: GadgetStatus.AVAILABLE,
        missionSuccessProbability: generateMissionProbability(),
      });

      // Invalidate cache for all gadgets
      await redisClient.del(GadgetController.getCacheKey('all'));
      
      res.status(201).json(newGadget);
    } catch (error) {
      console.error('Error creating gadget:', error);
      res.status(400).json({ error: 'Failed to create gadget', details: (error as Error).message || 'Unknown error' });
    }
  }

  // Update gadget with cache invalidation
  static async updateGadget(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, status } = req.body;
      const gadget = await Gadget.findByPk(id);

      if (!gadget) {
        res.status(404).json({ error: 'Gadget not found' });
        return;
      }

      if (name) gadget.name = name.trim();
      if (status && Object.values(GadgetStatus).includes(status)) {
        gadget.status = status;
        if (status === GadgetStatus.DECOMMISSIONED) {
          gadget.decommissionedAt = new Date();
        }
      }

      await gadget.save();

      // Invalidate specific gadget cache and all gadgets cache
      await Promise.all([
        redisClient.del(GadgetController.getCacheKey('id', id)),
        redisClient.del(GadgetController.getCacheKey('all'))
      ]);
      
      res.json(gadget);
    } catch (error) {
      console.error('Error updating gadget:', error);
      res.status(400).json({ error: 'Failed to update gadget' });
    }
  }

  // Self-destruct gadget with cache invalidation
  static async selfDestruct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const gadget = await Gadget.findByPk(id);
      if (!gadget) {
        res.status(404).json({ error: 'Gadget not found' });
        return;
      }

      gadget.status = GadgetStatus.DESTROYED;
      gadget.decommissionedAt = new Date();
      await gadget.save();

      // Invalidate caches
      await Promise.all([
        redisClient.del(GadgetController.getCacheKey('id', id)),
        redisClient.del(GadgetController.getCacheKey('all'))
      ]);

      res.json({ message: 'Self-destruct sequence initiated', confirmationCode: Math.random().toString(36).substring(2, 8) });
    } catch (error) {
      console.error('Self-destruct error:', error);
      res.status(500).json({ error: 'Self-destruct failed' });
    }
  }

  // Decommission gadget with cache invalidation
  static async decommissionGadget(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const gadget = await Gadget.findByPk(id);
      if (!gadget) {
        res.status(404).json({ error: 'Gadget not found' });
        return;
      }

      gadget.status = GadgetStatus.DECOMMISSIONED;
      gadget.decommissionedAt = new Date();
      await gadget.save();

      // Invalidate caches
      await Promise.all([
        redisClient.del(GadgetController.getCacheKey('id', id)),
        redisClient.del(GadgetController.getCacheKey('all'))
      ]);

      res.json(gadget);
    } catch (error) {
      console.error('Decommission error:', error);
      res.status(500).json({ error: 'Failed to decommission gadget' });
    }
  }

  // Get gadgets by status with caching
  static async getGadgetsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const cacheKey = GadgetController.getCacheKey('status', status);
      
      // Check Redis cache first
      const cachedGadgets = await redisClient.get(cacheKey);
      if (cachedGadgets) {
        res.json(JSON.parse(cachedGadgets));
        return;
      }

      const gadgets = await Gadget.findAll({ where: { status: status as GadgetStatus } });
      
      // Cache results for 1 hour
      await redisClient.set(cacheKey, JSON.stringify(gadgets), 'EX', 3600);
      
      res.json(gadgets);
    } catch (error) {
      console.error('Error retrieving gadgets by status:', error);
      res.status(500).json({ error: 'Failed to retrieve gadgets by status' });
    }
  }
}
