import { db } from "../db.js";
import { renderScriptSection } from "./utils/renderEngine.js";

export const dynamicResolvers = {
  Query: {
    ratePlans: async (_, { state, supplier }) => {
      try {
        const [rows] = await db.query(`
          SELECT * FROM rates_view
          WHERE State = ? AND SPL = ?
          LIMIT 10
        `, [state, supplier]);
        return rows;
      } catch (error) {
        console.error("Error fetching rate plans:", error);
        throw new Error("Error al obtener planes de tarifas");
      }
    },

    scriptTemplate: async (_, { supplier, state, channel, language }) => {
      try {
        const [scripts] = await db.query(`
          SELECT * FROM scripts_db.scripts
          WHERE provider_name = ? AND state = ? AND channel = ? AND language = ?
          LIMIT 1
        `, [supplier, state, channel, language]);

        if (!scripts.length) return null;

        const [sections] = await db.query(`
          SELECT section_id, section_order AS 'order', section_name AS title,
                 section_text AS content_template, JSON_EXTRACT(conditions, '$') AS required_variables
          FROM scripts_db.script_sections
          WHERE script_id = ?
          ORDER BY section_order ASC
        `, [scripts[0].script_id]);

        return {
          template_id: scripts[0].script_id,
          script_title: scripts[0].script_title,
          supplier: scripts[0].provider_name,
          state: scripts[0].state,
          channel: scripts[0].channel,
          language: scripts[0].language,
          sections
        };
      } catch (error) {
        console.error("Error fetching script template:", error);
        throw new Error("Error al obtener plantilla de script");
      }
    },

    renderedScript: async (_, { supplier, state, channel, language, rateId }) => {
      try {
        // Obtener la plantilla del script
        const template = await dynamicResolvers.Query.scriptTemplate(_, { supplier, state, channel, language });
        if (!template) return null;

        // Obtener el plan de tarifas específico
        const [ratePlans] = await db.query(`
          SELECT * FROM rates_view
          WHERE rate_id = ? AND State = ? AND SPL = ?
          LIMIT 1
        `, [rateId, state, supplier]);

        if (!ratePlans.length) return null;

        const ratePlan = ratePlans[0];

        // Renderizar las secciones
        const renderedSections = template.sections.map(section => ({
          section_id: section.section_id,
          order: section.order,
          title: section.title,
          rendered_content: renderScriptSection(section.content_template, ratePlan),
          required_variables: section.required_variables
        }));

        return {
          template_id: template.template_id,
          script_title: template.script_title,
          supplier: template.supplier,
          state: template.state,
          channel: template.channel,
          language: template.language,
          sections: renderedSections
        };
      } catch (error) {
        console.error("Error rendering script:", error);
        throw new Error("Error al renderizar script");
      }
    }
  },

  Mutation: {
    updateScriptSection: async (_, { input }) => {
      try {
        const { section_id, title, content_template } = input;
        
        // Actualizar la sección en la base de datos
        await db.query(`
          UPDATE scripts_db.script_sections 
          SET section_name = ?, section_text = ?
          WHERE section_id = ?
        `, [title, content_template, section_id]);

        // Obtener la sección actualizada
        const [updatedSections] = await db.query(`
          SELECT section_id, section_order AS 'order', section_name AS title,
                 section_text AS content_template, JSON_EXTRACT(conditions, '$') AS required_variables
          FROM scripts_db.script_sections
          WHERE section_id = ?
        `, [section_id]);

        if (!updatedSections.length) {
          throw new Error(`Sección con ID ${section_id} no encontrada`);
        }

        return updatedSections[0];
      } catch (error) {
        console.error("Error updating script section:", error);
        throw new Error("Error al actualizar sección del script");
      }
    }
  }
};
