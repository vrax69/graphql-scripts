import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import GraphQLJSON from "graphql-type-json";
import { db } from "./db.js";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { verifyAuthRemote } from "./middleware/verifyAuthRemote.js";

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    JSON: GraphQLJSON,
    ...resolvers,
  },
});

const PORT = process.env.PORT || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req }) => {
    const { user } = await verifyAuthRemote(req);
    if (!user) throw new Error("Acceso no autorizado");
    return { db, user };
  },
  cors: {
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
  },
});

console.log(`🚀 Servidor GraphQL protegido corriendo en ${url}`);
console.log("🧩 Valor actual de SKIP_AUTH:", process.env.SKIP_AUTH);
