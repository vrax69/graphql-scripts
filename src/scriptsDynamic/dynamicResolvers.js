// dynamicResolvers.js
import { db } from "./db.js";

export const resolvers = {
  Query: {
    renderedScript: async (_, { script_id, rateContext }) => {
      // Obtener el script principal
      const [scriptRows] = await db.query(
        `SELECT * FROM scripts WHERE script_id = ? LIMIT 1`, [script_id]
      );
      if (!scriptRows.length) return null;
      const script = scriptRows[0];

      // Obtener secciones
      const [sections] = await db.query(
        `SELECT * FROM script_sections WHERE script_id = ? ORDER BY section_order ASC`, [script_id]
      );

      // Filtrar por condiciones (state, service_type)
      const filteredSections = sections.filter(sec => {
        if (!sec.conditions) return true;
        let cond;
        try {
          cond = JSON.parse(sec.conditions);
        } catch {
          cond = {};
        }
        return (
          (!cond.states || cond.states.includes(rateContext.State)) &&
          (!cond.service_type || cond.service_type.includes(rateContext.Service_Type))
        );
      });

      // Renderizar variables dentro del texto
      const renderedSections = filteredSections.map(sec => {
        let text = sec.section_text;
        Object.entries(rateContext).forEach(([key, value]) => {
          text = text.replaceAll(`[${key.toUpperCase()}]`, value || "");
        });
        return {
          section_id: sec.section_id,
          section_name: sec.section_name,
          rendered_text: text
        };
      });

      return {
        script_id: script.script_id,
        script_title: script.script_title,
        provider_name: script.provider_name,
        sections: renderedSections
      };
    }
  }
};