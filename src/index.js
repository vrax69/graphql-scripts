// src/index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone"; // ✅ usamos el modo standalone
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { db } from "./db.js";

dotenv.config();

// Creamos el servidor Apollo (GraphQL)
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.PORT ;

// 🚀 Modo standalone de Apollo (ya incluye express interno)
const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req }) => {
    // 🔐 Autenticación simplificada - el frontend manejará la validación
    // Por ahora permitimos acceso libre para testing
    const mockUser = {
      id: 1,
      nombre: "QA User",
      rol: "QA",
      email: "qa@test.com"
    };
    
    return { 
      db, 
      user: mockUser
    };
  },
});

console.log(`🚀 Servidor GraphQL corriendo en ${url}`);
