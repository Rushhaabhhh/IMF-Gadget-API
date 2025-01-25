import Gadget from '../gadgetModel';
import redisClient from '../libs/redis';
import { generateCodename, generateSelfDestructCode } from '../libs/helper';

const CACHE_EXPIRATION = 3600; // 1 hour

export const resolvers = {
  Query: {
    gadgets: async (_: any, { status }: { status?: string }) => {
      const cacheKey = `gadgets:${status || 'all'}`;
      
      // Check Redis cache
      const cachedGadgets = await redisClient.get(cacheKey);
      if (cachedGadgets) return JSON.parse(cachedGadgets);

      // Fetch from database
      const gadgets = await Gadget.findAll({
        where: status ? { status } : {}
      });

      // Cache in Redis
      await redisClient.set(
        cacheKey, 
        JSON.stringify(gadgets), 
        'EX', 
        CACHE_EXPIRATION
      );

      return gadgets;
    },

    gadget: async (_: any, { id }: { id: string }) => {
      const cacheKey = `gadget:${id}`;
      
      // Check Redis cache
      const cachedGadget = await redisClient.get(cacheKey);
      if (cachedGadget) return JSON.parse(cachedGadget);

      // Fetch from database
      const gadget = await Gadget.findByPk(id);

      if (gadget) {
        // Cache in Redis
        await redisClient.set(
          cacheKey, 
          JSON.stringify(gadget), 
          'EX', 
          CACHE_EXPIRATION
        );
      }

      return gadget;
    }
  },

  Mutation: {
    createGadget: async (_: any, { name }: { name: string }) => {
      const newGadget = await Gadget.create({
        name,
        codename: generateCodename(),
        missionSuccessProbability: Math.floor(Math.random() * 100)
      });

      // Invalidate gadgets cache
      await redisClient.del('gadgets:all');

      return newGadget;
    },

    decommissionGadget: async (_: any, { id }: { id: string }) => {
      const [updatedCount] = await Gadget.update(
        { 
          status: 'Decommissioned', 
          decommissionedAt: new Date() 
        },
        { where: { id } }
      );

      // Invalidate caches
      await Promise.all([
        redisClient.del('gadgets:all'),
        redisClient.del(`gadget:${id}`),
        redisClient.del(`gadgets:Decommissioned`)
      ]);

      return Gadget.findByPk(id);
    },

    triggerSelfDestruct: async (_: any, { id }: { id: string }) => {
      const gadget = await Gadget.findByPk(id);
      
      if (!gadget) throw new Error('Gadget not found');

      const confirmationCode = generateSelfDestructCode();

      // Invalidate caches
      await Promise.all([
        redisClient.del('gadgets:all'),
        redisClient.del(`gadget:${id}`)
      ]);

      return {
        message: 'Self-destruct sequence initiated',
        confirmationCode,
        gadget
      };
    }
  }
};