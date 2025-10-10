graphql-scripts/
 ├── src/
 │   ├── index.js           ← Punto de entrada del servidor (arranca Apollo)
 │   ├── db.js              ← Conexión MySQL (reutilizable)
 │   ├── schema.js          ← Definición del esquema GraphQL (qué datos hay)
 │   ├── resolvers.js       ← Lógica que obtiene los datos
 │   └── modules/           ← (Futuro: carpetas separadas por entidad)
 │        ├── rates/
 │        │   ├── rateSchema.js
 │        │   ├── rateResolvers.js
 │        │   └── rateQueries.sql
 │        └── users/
 │            ├── userSchema.js
 │            ├── userResolvers.js
 │            └── userMutations.sql
 ├── .env
 ├── .gitignore
 ├── package.json
 ├── nodemon.json           ← (opcional, para ajustes del dev mode)
 └── README.md
