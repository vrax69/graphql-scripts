Perfecto 🔥 — aquí tienes el **README.md completo, limpio y formateado** para que lo copies y pegues directamente en tu proyecto (ya corregido para que se vea bien en GitHub o VSCode).
Está en formato **Markdown estándar** con emojis, encabezados y tablas bien alineadas 👇

---

```markdown
# ⚡️ GraphQL Energy Backend (Node.js + Apollo + MySQL)

API modular construida con **Node.js**, **Express** y **Apollo Server (GraphQL)**.  
Permite centralizar y consultar datos de **usuarios**, **tarifas (rates)** y **guiones (scripts)**  
desde diferentes bases de datos **MySQL** conectadas al entorno de **call center energético NWFG**.

---

## 🚀 Características principales

✅ API GraphQL moderna sobre **Express**  
✅ Conexión unificada a múltiples bases MySQL (`rates_db`, `user_data_tpv_staging`, `scripts_db`)  
✅ Modularidad: cada dominio tiene su propio *schema* y *resolvers*  
✅ Compatible con **PM2**, **Docker** o cualquier entorno Node  
✅ Reutiliza tus datos existentes (no rompe el backend anterior)  
✅ Listo para integrarse con el **frontend React NWFG**

---

## 📁 Estructura del Proyecto

```

graphql-scripts/
│
├── src/
│   ├── db.js                 → Configuración y conexión a MySQL
│   ├── index.js              → Punto de entrada (Express + Apollo Server)
│   ├── schema.js             → Fusión de todos los esquemas GraphQL
│   ├── resolvers.js          → Fusión de todos los resolvers
│   │
│   ├── users/                → Módulo de usuarios y proveedores
│   │   ├── userSchema.js     → Tipos y queries de usuarios
│   │   └── userResolvers.js  → Lógica SQL de consultas a usuarios
│   │
│   └── scripts/              → Módulo de guiones (scripts de venta)
│       ├── scriptSchema.js   → Tipos y queries de scripts
│       └── scriptResolvers.js→ Lógica SQL de consultas de scripts
│
├── .env                      → Variables de entorno
├── package.json              → Dependencias y scripts de ejecución
├── pnpm-lock.yaml            → Control de dependencias exacto
└── README.md                 → Documentación del proyecto

````

---

## ⚙️ Instalación

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tuusuario/graphql-scripts.git
cd graphql-scripts
````

### 2️⃣ Instalar dependencias

```bash
pnpm install
```

*(También puedes usar `npm install` o `yarn` si lo prefieres.)*

### 3️⃣ Crear archivo `.env`

```bash
NODE_ENV=development
PORT=4000

DB_HOST=172.26.12.67
DB_USER=admin
DB_PASSWORD=Usuario19.
DB_NAME=rates_db
```

### 4️⃣ Ejecutar el servidor

```bash
pnpm dev
```

El servidor se ejecutará en:

```
http://localhost:4000/graphql
```

---

## 🧠 Arquitectura de módulos

### 🗄️ `db.js` — Conexión a MySQL

Configura un *pool de conexiones* con `mysql2/promise`.
Permite que todas las queries compartan la misma conexión optimizada.

```js
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
```

---

### 🧩 `index.js` — Servidor Express + Apollo GraphQL

Arranca el servidor y monta el endpoint `/graphql`.

```js
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
```

* Configura **CORS** y **BodyParser**
* Inicia el servidor Apollo
* Inyecta el contexto `db` a todos los resolvers

---

### 🧬 `schema.js` — Esquema principal GraphQL

Fusiona los **tipos** de los módulos (`users`, `scripts`, `rates`).

```js
export const typeDefs = [
  gql`
    type RateView {
      Rate_ID: String
      Product_Name: String
      Rate: Float
      State: String
    }
    type Query {
      rates(limit: Int): [RateView]
    }
  `,
  userTypeDefs,
  scriptTypeDefs
];
```

---

### 🧠 `resolvers.js` — Resolvers globales

Une todos los resolvers y ejecuta las consultas SQL.

```js
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...scriptResolvers.Query,
    rates: async (_, { limit = 10 }) => {
      const [rows] = await db.query("SELECT * FROM rates_view LIMIT ?", [limit]);
      return rows;
    },
  },
};
```

---

## 👥 Módulo de Usuarios (`/src/users/`)

### `userSchema.js`

Define los tipos y relaciones de los usuarios del call center:

```graphql
type User {
  user_id: ID!
  nombre: String
  email: String
  rol: String
  centro: String
  proveedores: [ProviderAccount]
}

type ProviderAccount {
  tpv_id: String
  status: String
}

type Query {
  usuarios: [User]
}
```

### `userResolvers.js`

Consulta la base `user_data_tpv_staging`:

```js
Query: {
  usuarios: async () => {
    const [rows] = await db.query(`
      SELECT id AS user_id, nombre, email, rol, centro
      FROM user_data_tpv_staging.usuarios
    `);
    return rows;
  },
}
```

---

## 📜 Módulo de Guiones (`/src/scripts/`)

### `scriptSchema.js`

Estructura GraphQL de los guiones:

```graphql
type Script {
  script_id: ID!
  provider_name: String
  state: String
  language: String
  channel: String
  script_title: String
  version: String
  content: String
}

type Query {
  scriptsByUser(user_id: Int!): [Script]
}
```

### `scriptResolvers.js`

Obtiene los scripts asignados a cada usuario:

```js
Query: {
  scriptsByUser: async (_, { user_id }) => {
    const [rows] = await db.query(`
      SELECT s.script_id, s.script_title, s.provider_name, s.state, s.language,
             s.channel, s.version, s.content
      FROM scripts_db.scripts s
      JOIN scripts_db.script_assignments a ON s.script_id = a.script_id
      WHERE a.user_id = ?
    `, [user_id]);
    return rows;
  }
}
```

---

## 🧩 Ejemplos de Queries

### Obtener tarifas (rates)

```graphql
query {
  rates(limit: 5) {
    Product_Name
    Rate
    State
  }
}
```

### Obtener usuarios

```graphql
query {
  usuarios {
    nombre
    email
    rol
    centro
  }
}
```

### Obtener scripts asignados a un usuario

```graphql
query {
  scriptsByUser(user_id: 18) {
    script_title
    provider_name
    state
    version
  }
}
```

---

## 🛠 Dependencias principales

| Paquete            | Uso                                    |
| ------------------ | -------------------------------------- |
| **@apollo/server** | Motor GraphQL                          |
| **express**        | Framework HTTP base                    |
| **cors**           | Permitir llamadas desde otros orígenes |
| **body-parser**    | Parseo de JSON                         |
| **dotenv**         | Carga de variables de entorno          |
| **mysql2**         | Cliente MySQL                          |
| **graphql**        | Núcleo de GraphQL                      |
| **nodemon**        | Reinicio automático en desarrollo      |

---

## ⚙️ Comandos disponibles

| Comando              | Descripción                                           |
| -------------------- | ----------------------------------------------------- |
| `pnpm start`         | Ejecuta el servidor en modo producción                |
| `pnpm dev`           | Ejecuta el servidor con reinicio automático (nodemon) |
| `pnpm add <paquete>` | Instala dependencias adicionales                      |

---

## 💡 Próximos pasos

* [ ] Añadir Mutations para crear/editar scripts desde GraphQL
* [ ] Agregar control de roles (`reader`, `editor`, `reviewer`)
* [ ] Integrar autenticación JWT o sesión NWFG
* [ ] Documentar queries automáticas con **GraphQL Playground**

---

## 👨‍💻 Autor

Desarrollado por **Brian Llanes (bllanes)**
Integración: *Ecosistema NWFG / TPV Call Center*
Tecnologías: *Node.js, Express, Apollo, MySQL, GraphQL*

```

---

¿Quieres que te agregue al final un **diagrama visual de arquitectura** (en formato Mermaid para GitHub o VSCode) que muestre cómo se comunican los módulos y las bases de datos?  
Ejemplo: `Frontend → GraphQL Server → MySQL (rates_db, scripts_db, staging)`
```
