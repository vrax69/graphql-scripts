
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
src/
│
├── index.js                  # Arranque del servidor Apollo
├── db.js                     # Conexión MySQL
├── schema.js                 # Schema GraphQL principal
├── resolvers.js              # Resolvers principales
│
├── scriptsDynamic/
│   ├── dynamicSchema.js      # Schema dinámico (scripts)
│   ├── dynamicResolvers.js   # Resolvers dinámicos (scripts)   
│   ├──testQueries.graphql    # Query de prueba usada en Apollo Studio
│   └──utils/ 
│      ├── renderEngine.js    # Motor de renderizado (reemplazo dinámico)
│
├── users/
│   ├── userSchema.js         # Schema para usuarios
│   ├── userResolvers.js      # Resolvers para usuarios



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

estas son mis tablas actuales Table: script_assignments Columns: assignment_id bigint AI PK script_id bigint user_id bigint role enum('reader','editor','reviewer') Table: script_links Columns: link_id bigint AI PK script_id bigint rate_id varchar(50) utility_id bigint Table: script_sections Columns: section_id bigint AI PK script_id bigint section_order int section_name varchar(255) section_text longtext conditions json Table: scripts Columns: script_id bigint AI PK provider_name varchar(255) state varchar(50) language enum('EN','ES') channel enum('Inbound','Outbound','TPV','QA') script_title varchar(255) version varchar(50) content longtext created_at timestamp updated_at timestamp


TRUNCATE TABLE script_sections;

INSERT INTO script_sections (script_id, section_order, section_name, section_text, conditions) VALUES
-- Introducción
(1, 1, 'Pregunta de Introducción', 'Gracias por llamar a CTS, mi nombre es [AGENT_NAME]. Esta llamada está siendo grabada con propósitos de control de calidad. ¿En qué puedo ayudarle hoy?', '{}'),
(1, 2, 'Respuesta: energy_needs', 'Puedo ayudarle con sus necesidades energéticas', '{"motivo": ["energy_needs"]}'),
(1, 3, 'Respuesta: no_energy_needs', 'Entiendo. Aunque CTS no está asociado con la compañía de servicios públicos, vamos a ver si puedo ayudarle hoy. Después, puede recibir un paquete con opciones adicionales para su energía.', '{"motivo": ["no_energy_needs"]}'),

-- Datos del cliente
(1, 4, 'Datos del Cliente - Identificación', '• ¿Cuál es su nombre completo, por favor?\n• ¿Cuál es su dirección de servicio, incluyendo ciudad, estado y código postal?', '{}'),
(1, 5, 'Datos del Cliente - Electricidad', '¿Cuál es el nombre de su compañía eléctrica?', '{"service_type": ["Electric"]}'),
(1, 6, 'Datos del Cliente - Gas', '¿Cuál es el nombre de su compañía de gas?', '{"service_type": ["Gas"]}'),
(1, 7, 'Datos del Cliente - Ambos Servicios', '¿Cuál es el nombre de su compañía eléctrica y de gas?', '{"service_type": ["Electric", "Gas"]}'),
(1, 8, 'Datos del Cliente - pregunta porGas', '¿Cuál es el nombre de su compañía de gas? Si no tiene gas, no hay problema.', '{"service_type": ["Gas"]}'),

-- Consentimiento
(1, 9, 'Bloque de Consentimiento', 'Sr./Sra. [CUSTOMER_NAME], mi sistema muestra que usted puede calificar para participar en el Programa de Elección de Energía y recibir protección de precios en la porción de suministro de su [COMODITY], con un proveedor autorizado y aprobado en su estado.', '{}'),
(1, 10, 'Bloque de Consentimiento – Parte 2', '¿Da también su consentimiento para que CTS le envíe nuestro código promocional por mensaje de texto a ese número?\nPuede revocar este consentimiento enviando un correo electrónico a optout@comparetosave.net o llamando al 8444093888 ¿de acuerdo?', '{}'),

-- Términos y condiciones
(1, 11, 'Inicio de Términos y Condiciones', 'La siguiente parte de la llamada es en nombre de [SUPPLIER], un proveedor de energía autorizado.\n\nUsted puede ser elegible para un precio protegido, plan de [COMODITY] renovable sin cambiar sus hábitos de servicios públicos. Todos los planes de [COMODITY] tienen una tarifa fija durante la duración del contrato. Por lo tanto, no importa lo alto que suban los precios de la [COMODITY], su precio está garantizado para no aumentar durante su plazo.\n\n[Además, podría recibir hasta 100 $ en tarjetas regalo Visa al inscribirse en determinados planes]. Sólo necesito confirmar que cumple los requisitos.', '{}'),
(1, 12, 'Términos y Condiciones – Bono Visa', 'Además, podría recibir hasta 100 $ en tarjetas regalo Visa al inscribirse en determinados planes.', '{"product_name": ["Eco Rewards", "Gas Giveback"]}'),
(1, 13, 'calificacion', 'Sólo necesito confirmar que cumple los requisitos.', '{}'),

-- Verificaciones
(1, 15, 'Verificación - Titular MD/DC/NH', 'Por favor confirme si es usted el titular de la cuenta.', '{"states": ["MD", "DC", "NH"]}'),
(1, 16, 'Verificación - Titular Otros Estados', 'Por favor confirme si es usted el titular de la cuenta o la persona autorizada.', '{"exclude_states": ["MD", "DC", "NH"]}'),
(1, 17, 'Verificación - Ayuda Gubernamental', 'Por favor confirme si recibe algún tipo de ayuda gubernamental para pagar su factura de energía.', '{}'),
(1, 18, 'Verificación - Pagos', 'Por favor confirme si está al día con los pagos de su factura de electricidad.', '{}'),
(1, 19, 'Verificación - Pagos 30 días', '¿Tiene más de 30 días de atraso en el pago de su factura de electricidad?', '{"states": ["PA", "OH"]}'),
(1, 20, 'Verificación - Pagos 60 días', '¿Tiene más de 60 días de atraso en el pago de su factura de electricidad?', '{"exclude_states": ["PA", "OH"]}'),

-- Inicio de inscripción
(1, 21, 'Inicio de Inscripción', 'Según sus respuestas, usted cumple los requisitos. Ahora, para inscribirse en este nuevo plan de precio protegido, necesito que tome una copia de su factura de la luz y me avise cuando la tenga.\n\nAntes de continuar, debo informarle que, aunque no trabajo ni represento a su Empresa de Distribución Eléctrica ni a ningún otro Proveedor de Electricidad, participar en el programa Energy Choice es gratuito. Sin embargo, no se aplica automáticamente; es mi trabajo, en nombre de CleanSky Energy, ayudarle a asegurar una tarifa fija.', '{}'),

-- Datos de verificación de factura
(1, 22, 'Verificación - Datos de factura', '¿Cómo aparece el nombre en la factura, aunque esté mal escrito?', '{}'),
(1, 23, 'Verificación - Nombre del contacto', '¿Y su nombre?', '{}'),
(1, 24, 'Verificación - Dirección del servicio', '¿Cuál es la dirección de servicio exactamente como aparece en la factura, aunque esté mal escrita?', '{}'),
(1, 25, 'Verificación - Dirección de facturación', '¿Es su dirección de facturación la misma que su dirección de servicio?', '{}'),
(1, 26, 'Verificación - Compañía de servicios', 'Para proporcionarle las tarifas correctas, ¿cuál es el nombre de su compañía de servicios, por favor?', '{}'),
(1, 27, 'Verificación - Número de cuenta', '¿Cuál es su número de cuenta?', '{}'),
(1, 28, 'Verificación - Número de teléfono', 'Y su número de teléfono es [PHONE_NUMBER], ¿correcto?', '{}'),
(1, 29, 'Verificación - Facturas adicionales', 'Muy bien. ¿Tiene alguna otra factura de la luz de esta u otra localidad?', '{}'),
(1, 30, 'Verificación - Proveedor de gas', 'Si tiene gas natural, ¿quién es su proveedor de servicios de gas natural? También tenemos una gran oferta para eso.', '{}'),
(1, 31, 'Verificación - Presencia de CleanSky', 'En la sección de suministro de su factura, ¿ve las palabras "CleanSky Energy"? (Necesita un "NO" para continuar)', '{}'),
(1, 32, 'Verificación - Fecha de nacimiento (solo MA)', 'Por motivos de calidad de la inscripción, ¿cuál es su mes y fecha de nacimiento?', '{"states": ["MA"]}'),
(1, 33, 'Verificación - luz en otro lugar', 'Muy bien. ¿Tiene alguna otra factura de la luz de esta u otra localidad?', '{}'),
(1, 34, 'Verificación - ya cleansky', 'En la sección de suministro de su factura, ¿ve las palabras "CleanSky Energy"?', '{}'),

-- Presentación del plan
(1, 35, 'Anote', 'Genial, ahora anote su nueva tarifa eléctrica, que es nuestro plan de tarifas más popular:', '{}'),
(1, 36, 'Presentación del Plan - Electricidad', '[[PLAN_TEXT]]', '{"service_type": ["Electric"], "plan_variants": {"Embrace 6": "El plan Embrace 6 ofrece [TERM] meses de ELECTRICIDAD 100% RENOVABLE y una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales.", "Embrace 12": "El plan Embrace 12 ofrece [TERM] meses de ELECTRICIDAD 100% RENOVABLE y una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales.", "Embrace 24": "El plan Embrace 24 ofrece [TERM] meses de ELECTRICIDAD 100% RENOVABLE y una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales.", "Eco Rewards 6": "El plan Eco Rewards 6 ofrece [TERM] meses de ELECTRICIDAD 100% RENOVABLE y una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales Y $100 en Tarjetas Regalo Visa dispersas a lo largo de su contrato.", "Eco Rewards 12": "El plan Eco Rewards 12 ofrece [TERM] meses de ELECTRICIDAD 100% RENOVABLE y una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales Y $100 en Tarjetas Regalo Visa dispersas a lo largo de su contrato.", "Eco Rewards 24": "El plan Eco Rewards 24 ofrece [TERM] meses de ELECTRICIDAD 100% RENOVABLE y una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales Y $100 en Tarjetas Regalo Visa dispersas a lo largo de su contrato."}}'),
(1, 37, 'Presentación del Plan - Gas', '[[PLAN_TEXT_GAS]]', '{"service_type": ["Gas"], "plan_variants": {"Gas Give Back 24": "El plan Gas Give Back 24 ofrece [TERM] meses de GAS NATURAL con una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales y DOBLARÁ las recompensas de su tarjeta regalo Visa.", "Affordable Gas 12": "El plan Affordable Gas 12 ofrece [TERM] meses de GAS NATURAL con una tarifa fija de [RATE] por [UNIT_OF_MEASURE] sin cuotas mensuales."}}'),

-- Cierre y facturación
(1, 38, 'Cargo por Cancelación', 'Cargo por cancelación: Si decide cancelar su plan de protección de precios, después de su período de rescisión, habrá un pequeño cargo por cancelación de [[ETF_TEXT]].', '{"type": "etf_notice"}'),
(1, 39, 'Diferencia en la Factura', 'La única diferencia que verá en su factura es una línea con el nombre de [SUPPLIER] como su nuevo proveedor, y esa tarifa aparecerá bajo la parte de suministro de la factura, eso es todo. ¿Entendido?', '{}');

