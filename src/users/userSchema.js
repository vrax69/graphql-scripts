// src/users/userSchema.js
import gql from "graphql-tag";

export const userTypeDefs = gql`
  type ProviderAccount {
    provider_id: ID
    tpv_id: String
    tpv_username: String
    status: String
    updated_at: String
  }

  type User {
    user_id: ID
    nombre: String
    email: String
    rol: String
    centro: String
    status: String
    created_at: String
    proveedores: [ProviderAccount]
  }

  type Query {
    usuarios(limit: Int = 10): [User]
    usuario(id: ID!): User
  }
`;
