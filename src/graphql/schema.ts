import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  enum GadgetStatus {
    Available
    Deployed
    Destroyed
    Decommissioned
  }

  type Gadget {
    id: ID!
    name: String!
    codename: String!
    status: GadgetStatus!
    missionSuccessProbability: Int!
    decommissionedAt: String
  }

  type SelfDestructResponse {
    message: String!
    confirmationCode: String
    gadget: Gadget
  }

  type Query {
    gadgets(status: GadgetStatus): [Gadget!]!
    gadget(id: ID!): Gadget
  }

  type Mutation {
    createGadget(name: String!): Gadget!
    decommissionGadget(id: ID!): Gadget!
    triggerSelfDestruct(id: ID!): SelfDestructResponse!
  }
`;