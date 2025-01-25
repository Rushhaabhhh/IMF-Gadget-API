import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import sequelize from './libs/database';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();

  const apolloServer = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ({ req }) => ({ req })
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ 
    app: app as any, 
    path: '/graphql' 
  });

  sequelize.sync().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/graphql`);
    });
  });
}

startServer().catch(console.error);