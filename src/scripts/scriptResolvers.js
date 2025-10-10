import { db } from "../db.js";

export const scriptResolvers = {
  Query: {
    guion: async (_, { user_id, rate_id }) => {
      // Consulta al usuario
      const [userRows] = await db.query(
        `SELECT nombre FROM usuarios WHERE id = ? LIMIT 1`,
        [user_id]
      );
      const usuario = userRows[0];

      // Consulta al rate
      const [rateRows] = await db.query(
        `SELECT Product_Name, Rate, Company_DBA_Name FROM rates_view WHERE Rate_ID = ? LIMIT 1`,
        [rate_id]
      );
      const rate = rateRows[0];

      // Generar texto del guion
      const texto = `Hola, mi nombre es ${usuario?.nombre || "Agente"} y te llamo para ofrecerte el plan ${rate?.Product_Name || "desconocido"} de ${rate?.Company_DBA_Name || "nuestra compañía"} a una tarifa de ${rate?.Rate || "N/A"} por kWh.`;

      return {
        id: `${user_id}-${rate_id}`,
        texto,
        usuario,
        rate,
      };
    },
  },
};
