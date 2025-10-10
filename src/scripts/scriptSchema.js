import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Script {
    id: ID!
    texto: String
    usuario: User
    rate: RateView
  }

  extend type Query {
    guion(user_id: ID!, rate_id: String!): Script
  }
`;
