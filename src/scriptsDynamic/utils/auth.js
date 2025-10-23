// src/scriptsDynamic/utils/auth.js
// 🔐 Utilidades de autenticación y validación de roles para QA

/**
 * Valida que el usuario tenga los permisos necesarios para realizar una acción
 * @param {Object} user - Objeto usuario del contexto
 * @param {Array} allowedRoles - Roles permitidos ['QA', 'Administrador']
 * @throws {Error} Si el usuario no tiene permisos
 */
export function requireRole(user, allowedRoles = []) {
  if (!user) {
    throw new Error("🔒 Acceso denegado: Usuario no autenticado");
  }
  
  if (!user.rol || !allowedRoles.includes(user.rol)) {
    throw new Error(`🔒 Acceso denegado: Rol '${user.rol}' no tiene permisos para esta acción. Roles permitidos: ${allowedRoles.join(', ')}`);
  }
  
  return true;
}

/**
 * Valida que el usuario tenga permisos de QA o Administrador
 * @param {Object} user - Objeto usuario del contexto
 */
export function requireQAOrAdmin(user) {
  return requireRole(user, ['QA', 'Administrador']);
}

/**
 * Valida que el usuario tenga permisos de Administrador
 * @param {Object} user - Objeto usuario del contexto
 */
export function requireAdmin(user) {
  return requireRole(user, ['Administrador']);
}

/**
 * Middleware para validar permisos en resolvers
 * @param {Function} resolver - Función resolver original
 * @param {Array} allowedRoles - Roles permitidos
 * @returns {Function} Resolver con validación de permisos
 */
export function withAuth(resolver, allowedRoles = ['QA', 'Administrador']) {
  return async (parent, args, context, info) => {
    requireRole(context.user, allowedRoles);
    return resolver(parent, args, context, info);
  };
}

/**
 * Simula un usuario QA para testing (temporal)
 * TODO: Reemplazar con autenticación real JWT
 */
export function mockQAUser() {
  return {
    id: 1,
    nombre: "QA Tester",
    rol: "QA",
    email: "qa@test.com"
  };
}

/**
 * Simula un usuario Administrador para testing (temporal)
 * TODO: Reemplazar con autenticación real JWT
 */
export function mockAdminUser() {
  return {
    id: 2,
    nombre: "Admin User",
    rol: "Administrador", 
    email: "admin@test.com"
  };
}
