import { Request, Response, NextFunction } from 'express';
import Gadget from './gadgetModel';
import { generateCodename, generateSelfDestructCode } from './libs/helper';

export const getGadgets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { status } = req.query;
  try {
    const gadgets = await Gadget.findAll({
      where: status ? { status: status as string } : {}
    });
    res.json(gadgets);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    next(error);
  }
};

export const addGadget = async (req: Request, res: Response) => {
  try {
    const newGadget = await Gadget.create({
      ...req.body,
      codename: generateCodename(),
      missionSuccessProbability: Math.floor(Math.random() * 100)
    });
    res.status(201).json(newGadget);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const decommissionGadget = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [updated] = await Gadget.update(
      { status: 'Decommissioned', decommissionedAt: new Date() },
      { where: { id } }
    );
    updated 
      ? res.json({ message: 'Gadget decommissioned' }) 
      : res.status(404).json({ error: 'Gadget not found' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const triggerSelfDestruct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const confirmationCode = generateSelfDestructCode();
  
  try {
    const gadget = await Gadget.findByPk(id);
    if (!gadget) return res.status(404).json({ error: 'Gadget not found' });

    // Simulate self-destruct sequence
    res.json({ 
      message: 'Self-destruct sequence initiated', 
      confirmationCode,
      gadget: {
        id: gadget.id,
        name: gadget.name,
        status: 'Destroyed'
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};