import { gql } from "graphql-tag";

export const scriptTypeDefs = gql`
  type Script {
    script_id: ID!
    provider_name: String
    state: String
    language: String
    channel: String
    script_title: String
    version: String
    content: String
    created_at: String
    updated_at: String
  }

  type Query {
    scriptsByUser(user_id: Int!): [Script]
  }
`;
