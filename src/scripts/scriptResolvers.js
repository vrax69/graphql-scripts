import { db } from "../db.js";

export const scriptResolvers = {
  Query: {
    scriptsByUser: async (_, { user_id }) => {
      try {
        const [rows] = await db.query(`
          SELECT s.script_id, s.provider_name, s.state, s.language, s.channel,
                 s.script_title, s.version, s.content, s.created_at, s.updated_at
          FROM scripts_db.scripts s
          JOIN scripts_db.script_assignments a ON s.script_id = a.script_id
          WHERE a.user_id = ?
        `, [user_id]);
        return rows;
      } catch (error) {
        console.error("Error al obtener los scripts del usuario:", error);
        throw new Error("Error al consultar scriptsByUser");
      }
    }
  }
};
