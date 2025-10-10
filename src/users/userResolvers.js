// src/users/userResolvers.js
export const userResolvers = {
    Query: {
      usuarios: async (_, { limit }, { db }) => {
        // Obtenemos los usuarios principales
        const [users] = await db.query(
          `SELECT id AS user_id, nombre, email, rol, centro, status, creado_en AS created_at
           FROM user_data_tpv_staging.usuarios
           LIMIT ?`,
          [limit]
        );
  
        // Obtenemos las cuentas TPV asociadas
        const userIds = users.map(u => u.user_id);
        if (userIds.length === 0) return [];
  
        const [accounts] = await db.query(
          `SELECT user_id, provider_id, tpv_id, tpv_username, status, updated_at
           FROM user_data_tpv_staging.user_provider_account
           WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
          userIds
        );
  
        // Asocia cada cuenta al usuario correspondiente
        const grouped = {};
        for (const acc of accounts) {
          if (!grouped[acc.user_id]) grouped[acc.user_id] = [];
          grouped[acc.user_id].push(acc);
        }
  
        return users.map(u => ({
          ...u,
          proveedores: grouped[u.user_id] || [],
        }));
      },
  
      usuario: async (_, { id }, { db }) => {
        const [[user]] = await db.query(
          `SELECT id AS user_id, nombre, email, rol, centro, status, creado_en AS created_at
           FROM user_data_tpv_staging.usuarios
           WHERE id = ?`,
          [id]
        );
        if (!user) return null;
  
        const [accounts] = await db.query(
          `SELECT provider_id, tpv_id, tpv_username, status, updated_at
           FROM user_data_tpv_staging.user_provider_account
           WHERE user_id = ?`,
          [id]
        );
  
        return { ...user, proveedores: accounts };
      },
    },
  };
  