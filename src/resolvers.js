import { db } from "./db.js";
import { userResolvers } from "./users/userResolvers.js";
import { scriptResolvers } from "./scripts/scriptResolvers.js";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...scriptResolvers.Query,   // ← añade esta línea
    rates: async (_, { limit = 10 }) => {
      const [rows] = await db.query(`
        SELECT 
          Rate_ID, Standard_Utility_Name, Product_Name, Rate, ETF, MSF,
          duracion_rate, Company_DBA_Name, DATE_FORMAT(Last_Updated, '%Y-%m-%d') AS Last_Updated,
          SPL, State, LDC, Logo_URL, Service_Type, Unit_of_Measure, Excel_Status, utility_contact
        FROM rates_view
        WHERE LOWER(TRIM(Excel_Status)) <> 'missing'
        LIMIT ?
      `, [limit]);
      return rows;
    },
  },
};
