// src/scriptsDynamic/dynamicResolvers.js
import { db } from "../db.js";
import { renderScriptSection } from "./utils/renderEngine.js";

export const dynamicResolvers = {
  Query: {
    renderedScript: async (_, { script_id, rateContext }) => {
      // 1️⃣ Obtener script base
      const [scripts] = await db.query(
        `SELECT * FROM scripts WHERE script_id = ? LIMIT 1`,
        [script_id]
      );
      if (!scripts.length) return null;
      const script = scripts[0];

      // 2️⃣ Obtener secciones
      const [sections] = await db.query(
        `SELECT * FROM script_sections WHERE script_id = ? ORDER BY section_order ASC`,
        [script_id]
      );

      // 3️⃣ Normalizar tipos de servicio
      const serviceTypes = Array.isArray(rateContext.Service_Type)
        ? rateContext.Service_Type
        : [rateContext.Service_Type].filter(Boolean);

      // 4️⃣ Filtrado de condiciones
      const filteredSections = sections.filter(sec => {
        let cond = {};
        try {
          cond = JSON.parse(sec.conditions || "{}");
        } catch (err) {
          console.warn(`⚠️ Error parsing conditions for section ${sec.section_name}:`, err);
        }

        const matchState =
          (!cond.states || cond.states.includes(rateContext.State)) &&
          (!cond.exclude_states || !cond.exclude_states.includes(rateContext.State));

        const matchService =
          !cond.service_type ||
          cond.service_type.some(st => serviceTypes.includes(st));

        const matchProduct =
          !cond.product_name ||
          cond.product_name.includes(rateContext.Product_Name);

        return matchState && matchService && matchProduct;
      });

      // 5️⃣ Renderizar texto dinámico
      const renderedSections = filteredSections.map(sec => ({
        section_id: sec.section_id,
        section_name: sec.section_name,
        rendered_text: renderScriptSection(sec.section_text, rateContext),
      }));

      // 6️⃣ Respuesta final
      return {
        script_id: script.script_id,
        script_title: script.script_title,
        provider_name: script.provider_name,
        language: script.language,
        channel: script.channel,
        sections: renderedSections,
      };
    },
  },
};
