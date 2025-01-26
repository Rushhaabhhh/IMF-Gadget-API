import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Gadget from './gadgetModel';
import { generateCodename, generateSelfDestructCode } from './libs/helper';
import redisClient from './libs/redis';
import jwt from 'jsonwebtoken';


const CACHE_EXPIRATION = 3600;

// Centralized cache invalidation utility
const invalidateGadgetCaches = async (keys: string[]) => {
  await Promise.all(keys.map(key => redisClient.del(key)));
};

export const getGadgets = async (req: Request, res: Response): Promise<void> => {
  const { status, search } = req.query;
  const cacheKey = `gadgets:${status || 'all'}:${search || ''}`;

  try {
    // Check Redis cache
    const cachedGadgets = await redisClient.get(cacheKey);
    if (cachedGadgets) {
      res.json(JSON.parse(cachedGadgets));
      return;
    }

    // Flexible query with optional filtering
    const whereCondition = {
      ...(status && { status: status as string }),
      ...(search && { 
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { codename: { [Op.iLike]: `%${search}%` } }
        ]
      })
    };

    const gadgets = await Gadget.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });

    // Cache results
    await redisClient.set(cacheKey, JSON.stringify(gadgets), 'EX', CACHE_EXPIRATION);

    res.json(gadgets);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve gadgets', 
      details: (error as Error).message 
    });
  }
};

export const getGadgetById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const cacheKey = `gadget:${id}`;

  try {
    // Check Redis cache
    const cachedGadget = await redisClient.get(cacheKey);
    if (cachedGadget) {
      res.json(JSON.parse(cachedGadget));
      return;
    }

    // Fetch gadget with detailed error handling
    const gadget = await Gadget.findByPk(id);
    if (!gadget) {
      res.status(404).json({ error: 'Gadget not found' });
      return;
    }

    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(gadget), 'EX', CACHE_EXPIRATION);

    res.json(gadget);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error retrieving gadget', 
      details: (error as Error).message 
    });
  }
};


export const addGadget = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract and verify JWT token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify the token
    let decoded;
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500).json({ error: 'JWT secret is not defined' });
        return;
      }
      decoded = jwt.verify(token, secret) as unknown as { userId: string };
    } catch (tokenError) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Validate input
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Gadget name is required' });
      return;
    }

    // Create new gadget with user ID and additional metadata
    const newGadget = await Gadget.create({
      ...req.body,
      userId: decoded.userId, // Associate gadget with the authenticated user
      codename: generateCodename(),
      missionSuccessProbability: Math.floor(Math.random() * 100)
    });

    // Invalidate relevant caches
    await invalidateGadgetCaches([
      'gadgets:all', 
      'gadgets:Available'
    ]);

    res.status(201).json({
      message: 'Gadget created successfully',
      gadget: newGadget,
      userId: decoded.userId
    });
  } catch (error) {
    // More detailed error handling
    console.error('Gadget creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create gadget', 
      details: (error as Error).message 
    });
  }
};

export const decommissionGadget = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const gadget = await Gadget.findByPk(id);
    if (!gadget) {
      res.status(404).json({ error: 'Gadget not found' });
      return;
    }

    // Prevent multiple decommissioning
    if (gadget.status === 'Decommissioned') {
      res.status(400).json({ error: 'Gadget already decommissioned' });
      return;
    }

    await gadget.update({
      status: 'Decommissioned', 
      decommissionedAt: new Date()
    });

    // Invalidate caches
    await invalidateGadgetCaches([
      'gadgets:all',
      `gadget:${id}`,
      'gadgets:Available',
      'gadgets:Decommissioned'
    ]);

    res.json({ message: 'Gadget successfully decommissioned' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to decommission gadget', 
      details: (error as Error).message 
    });
  }
};

export const triggerSelfDestruct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const gadget = await Gadget.findByPk(id);
    if (!gadget) {
      res.status(404).json({ error: 'Gadget not found' });
      return;
    }

    // Prevent multiple self-destructs
    if (gadget.status === 'Destroyed') {
      res.status(400).json({ error: 'Gadget already destroyed' });
      return;
    }

    const confirmationCode = generateSelfDestructCode();

    // Update gadget status
    await gadget.update({ status: 'Destroyed' });

    // Invalidate caches
    await invalidateGadgetCaches([
      'gadgets:all',
      `gadget:${id}`,
      'gadgets:Available',
      'gadgets:Destroyed'
    ]);

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
    res.status(500).json({ 
      error: 'Self-destruct sequence failed', 
      details: (error as Error).message 
    });
  }
};