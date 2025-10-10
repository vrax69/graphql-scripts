## 📂 Segunda estructura del proyecto

```graphql-scripts/
│
├─ .env
├─ src/
│   ├─ index.js          ← servidor principal
│   ├─ db.js             ← conexión MySQL (ya lista)
│   ├─ schema.js         ← une todos los typeDefs
│   ├─ resolvers.js      ← une todos los resolvers
│   │
│   ├─ rates/
│   │   ├─ ratesSchema.js     ← modelo de rates_view
│   │   └─ ratesResolvers.js  ← query rates()
│   │
│   ├─ users/
│   │   ├─ userSchema.js      ← modelo de usuarios + proveedores
│   │   └─ userResolvers.js   ← query usuarios(), usuario()
│   │
│   └─ scripts/
│       ├─ scriptSchema.js    ← modelo de guiones (teleprompter)
│       └─ scriptResolvers.js ← queries de guiones
