// src/scriptsDynamic/dynamicResolvers.js
import { db } from "../db.js";
import { renderScriptSection } from "./utils/renderEngine.js"; // 👈 asegúrate de importar esto

export const dynamicResolvers = {
  Query: {
    renderedScript: async (_, { script_id, rateContext }) => {
      const [scripts] = await db.query(
        `SELECT * FROM scripts WHERE script_id = ? LIMIT 1`,
        [script_id]
      );
      if (!scripts.length) return null;
      const script = scripts[0];

      const [sections] = await db.query(
        `SELECT * FROM script_sections WHERE script_id = ? ORDER BY section_order ASC`,
        [script_id]
      );

      // Normalizar Service_Type
      const serviceTypes = Array.isArray(rateContext.Service_Type)
        ? rateContext.Service_Type
        : [rateContext.Service_Type].filter(Boolean);

      // Filtrado de condiciones
      const filteredSections = sections.filter(sec => {
        let cond = {};
        try { cond = JSON.parse(sec.conditions || "{}"); } catch {}
        return (
          (!cond.states || cond.states.includes(rateContext.State)) &&
          (!cond.service_type || cond.service_type.some(st => serviceTypes.includes(st))) &&
          (!cond.product_name || cond.product_name.includes(rateContext.Product_Name))
        );
      });

      // 🔧 Aplicar render dinámico correctamente
      const renderedSections = filteredSections.map(sec => ({
        section_id: sec.section_id,
        section_name: sec.section_name,
        rendered_text: renderScriptSection(sec.section_text, rateContext) // 👈 AQUÍ
      }));

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
