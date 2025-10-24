import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { db } from "./db.js";

dotenv.config();

const PORT = process.env.PORT;
const AUTH_URL = process.env.AUTH_SERVICE_URL;
const SKIP_AUTH = process.env.SKIP_AUTH === "1";

// 🧠 Log de depuración
console.log("🧩 Valor actual de SKIP_AUTH:", SKIP_AUTH);
console.log("🔐 AUTH_SERVICE_URL:", AUTH_URL);

// Crear servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req }) => {
    let user = null;

    if (SKIP_AUTH) {
      // 🚪 Modo libre (testing)
      user = { id: 1, nombre: "QA User", rol: "QA", email: "qa@test.com" };
    } else {
      // 🔐 Modo autenticado (producción)
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Token requerido");

      try {
        const response = await axios.get(AUTH_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        user = response.data.user || null;
        if (!user) throw new Error("Token inválido o expirado");
      } catch (error) {
        console.error("❌ Error de verificación remota:", error.message);
        throw new Error("Token inválido o expirado");
      }
    }

    return { db, user };
  },
});

console.log(`🚀 Servidor GraphQL corriendo en ${url}`);
