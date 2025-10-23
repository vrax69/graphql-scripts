# 🔧 Motor de Edición de Scripts para QA

## 📋 Resumen de Cambios Implementados

### ✅ 1. Esquema GraphQL Extendido (`dynamicSchema.js`)
- **Nuevos tipos**: `ScriptInfo`, `SectionInfo`
- **Nuevas queries**: `scriptsList`, `scriptSections`, `sectionDetails`
- **Nuevas mutations**: `createSection`, `updateSection`, `deleteSection`, `reorderSections`

### ✅ 2. Resolvers de Edición (`dynamicResolvers.js`)
- **Queries para QA**: Listar scripts, obtener secciones, detalles de sección
- **Mutations CRUD**: Crear, actualizar, eliminar y reordenar secciones
- **Validaciones**: Verificación de existencia de scripts/secciones
- **Autenticación**: Preparado para JWT (comentado temporalmente)

### ✅ 3. Sistema de Autenticación (`utils/auth.js`)
- **Funciones de validación**: `requireRole`, `requireQAOrAdmin`, `requireAdmin`
- **Middleware**: `withAuth` para proteger resolvers
- **Mock users**: Para testing (QA y Admin)

### ✅ 4. Contexto Simplificado (`index.js`)
- **Usuario mock**: Configurado para testing
- **Preparado para JWT**: Estructura lista para autenticación real

---

## 🚀 Ejemplos de Uso GraphQL

### 📖 Queries para QA

#### 1. Listar todos los scripts
```graphql
query {
  scriptsList {
    script_id
    script_title
    provider_name
    language
    channel
    total_sections
  }
}
```

#### 2. Obtener secciones de un script
```graphql
query {
  scriptSections(script_id: "1") {
    section_id
    section_order
    section_name
    section_text
    conditions
  }
}
```

#### 3. Detalles de una sección específica
```graphql
query {
  sectionDetails(section_id: "5") {
    section_id
    script_id
    section_order
    section_name
    section_text
    conditions
  }
}
```

### ✏️ Mutations para Edición

#### 1. Crear nueva sección
```graphql
mutation {
  createSection(
    script_id: "1"
    section_order: 3
    section_name: "Nueva Sección"
    section_text: "Hola {{Customer_Name}}, tu tasa es {{Rate}}"
    conditions: "{\"states\": [\"TX\", \"CA\"]}"
  ) {
    section_id
    section_name
    section_text
  }
}
```

#### 2. Actualizar sección existente
```graphql
mutation {
  updateSection(
    section_id: "5"
    section_name: "Sección Actualizada"
    section_text: "Texto modificado con {{Agent_Name}}"
    conditions: "{\"service_type\": [\"Electric\"]}"
  ) {
    section_id
    section_name
    section_text
    conditions
  }
}
```

#### 3. Eliminar sección
```graphql
mutation {
  deleteSection(section_id: "5")
}
```

#### 4. Reordenar secciones
```graphql
mutation {
  reorderSections(
    script_id: "1"
    section_orders: [
      { section_id: "3", section_order: 1 }
      { section_id: "1", section_order: 2 }
      { section_id: "2", section_order: 3 }
    ]
  )
}
```

---

## 🔄 Flujo de Trabajo QA

### 1. **Panel de Listado**
- Query `scriptsList` → Mostrar todos los scripts disponibles
- Mostrar conteo de secciones por script

### 2. **Editor de Script**
- Query `scriptSections(script_id)` → Cargar secciones del script
- Mostrar lista de secciones con orden editable

### 3. **Editor de Sección**
- Query `sectionDetails(section_id)` → Cargar detalles específicos
- Editar `section_text` con placeholders dinámicos
- Editar `conditions` JSON para filtros

### 4. **Guardar Cambios**
- Mutation `updateSection` → Guardar cambios
- Mutation `reorderSections` → Cambiar orden
- Mutation `createSection` → Agregar nueva sección
- Mutation `deleteSection` → Eliminar sección

### 5. **Preview en Tiempo Real**
- Query `renderedScript` → Ver resultado final con datos de prueba

---

## 🛠️ Próximos Pasos

### Frontend QA Panel
1. **Lista de Scripts**: Componente que use `scriptsList`
2. **Editor de Secciones**: Drag & drop para reordenar
3. **Editor de Texto**: WYSIWYG con placeholders
4. **Editor de Condiciones**: JSON editor con validación
5. **Preview**: Mostrar resultado renderizado

### Autenticación Real
1. **JWT Implementation**: Descomentar validaciones en resolvers
2. **Login/Logout**: Frontend manejará tokens
3. **Roles**: QA, Administrador, Agente

### Auditoría (Opcional)
1. **Tabla `script_revisions`**: Historial de cambios
2. **Mutation `updateSection`**: Registrar cambios automáticamente
3. **Query `revisionHistory`**: Ver historial por sección

---

## 🎯 Estado Actual

✅ **Backend completo y funcional**
✅ **Todas las operaciones CRUD implementadas**
✅ **Validaciones de datos**
✅ **Estructura preparada para autenticación**
✅ **Sin errores de linting**

**¡Listo para conectar con el frontend!** 🚀

