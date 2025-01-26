import { Request, Response } from 'express';
import { Gadget, GadgetStatus } from './gadgetModel';
import { Op } from 'sequelize';
import { generateCodename, generateMissionProbability } from './libs/helper';

export class GadgetController {
  // Get all gadgets with mission success probability
  static async getAllGadgets(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const whereClause = status 
        ? { status: status as GadgetStatus } 
        : {};

      const gadgets = await Gadget.findAll({ 
        where: whereClause
      });

      res.json(gadgets);
    } catch (error) {
      console.error('Error retrieving gadgets:', error);
      res.status(500).json({ error: 'Failed to retrieve gadgets' });
    }
  }

  // Add a new gadget with validation
  public static async addGadget(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      // Validate input
      if (!name || name.trim() === '') {
        res.status(400).json({ error: 'Gadget name is required' });
        return;
      }

      // Generate unique codename
      const codename = generateCodename();

      // Check if codename already exists
      const existingGadget = await Gadget.findOne({ 
        where: { codename } 
      });

      if (existingGadget) {
        res.status(409).json({ error: 'Duplicate codename generated' });
        return;
      }

      const newGadget = await Gadget.create({
        name: name.trim(),
        codename,
        status: GadgetStatus.AVAILABLE,
        missionSuccessProbability: generateMissionProbability()
      });

      res.status(201).json(newGadget);
    } catch (error) {
      console.error('Error creating gadget:', error);
      res.status(400).json({ error: 'Failed to create gadget', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Self-destruct sequence
  static async selfDestruct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const confirmationCode = Math.random().toString(36).substring(2, 8);

      const gadget = await Gadget.findByPk(id);
      if (!gadget) {
        res.status(404).json({ error: 'Gadget not found' });
        return;
      }

      // Simulate self-destruct
      gadget.status = GadgetStatus.DESTROYED;
      gadget.decommissionedAt = new Date();
      await gadget.save();

      res.json({ 
        message: 'Self-destruct sequence initiated', 
        confirmationCode 
      });
    } catch (error) {
      console.error('Self-destruct error:', error);
      res.status(500).json({ error: 'Self-destruct failed' });
    }
  }
}

