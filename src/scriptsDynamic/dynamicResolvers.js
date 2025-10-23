// src/scriptsDynamic/dynamicResolvers.js
import { db } from "../db.js";
import { renderScriptSection } from "./utils/renderEngine.js";
// import { requireQAOrAdmin, requireAdmin } from "./utils/auth.js"; // Comentado para simplificar

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

    // 🔧 Queries para QA - Panel de edición
    scriptsList: async (_, __, { user }) => {
      // requireQAOrAdmin(user); // Comentado temporalmente - frontend manejará auth
      
      const [scripts] = await db.query(`
        SELECT 
          s.script_id,
          s.script_title,
          s.provider_name,
          s.language,
          s.channel,
          COUNT(ss.section_id) as total_sections
        FROM scripts s
        LEFT JOIN script_sections ss ON s.script_id = ss.script_id
        GROUP BY s.script_id, s.script_title, s.provider_name, s.language, s.channel
        ORDER BY s.script_title ASC
      `);
      
      return scripts.map(script => ({
        script_id: script.script_id,
        script_title: script.script_title,
        provider_name: script.provider_name,
        language: script.language,
        channel: script.channel,
        total_sections: parseInt(script.total_sections) || 0,
      }));
    },

    scriptSections: async (_, { script_id }, { user }) => {
      // requireQAOrAdmin(user); // Comentado temporalmente - frontend manejará auth
      
      const [sections] = await db.query(`
        SELECT 
          section_id,
          script_id,
          section_order,
          section_name,
          section_text,
          conditions
        FROM script_sections 
        WHERE script_id = ? 
        ORDER BY section_order ASC
      `, [script_id]);
      
      return sections.map(section => ({
        section_id: section.section_id,
        script_id: section.script_id,
        section_order: section.section_order,
        section_name: section.section_name,
        section_text: section.section_text,
        conditions: section.conditions || "{}",
      }));
    },

    sectionDetails: async (_, { section_id }, { user }) => {
      // requireQAOrAdmin(user); // Comentado temporalmente - frontend manejará auth
      
      const [[section]] = await db.query(`
        SELECT 
          section_id,
          script_id,
          section_order,
          section_name,
          section_text,
          conditions
        FROM script_sections 
        WHERE section_id = ?
      `, [section_id]);
      
      if (!section) {
        throw new Error(`Sección con ID ${section_id} no encontrada`);
      }
      
      return {
        section_id: section.section_id,
        script_id: section.script_id,
        section_order: section.section_order,
        section_name: section.section_name,
        section_text: section.section_text,
        conditions: section.conditions || "{}",
      };
    },
  },

  Mutation: {
    // 🔧 Mutations para QA - Edición de scripts
    createSection: async (_, args, { user }) => {
      // requireQAOrAdmin(user); // Comentado temporalmente - frontend manejará auth
      
      const { script_id, section_order, section_name, section_text, conditions } = args;
      
      // Validar que el script existe
      const [[script]] = await db.query(
        `SELECT script_id FROM scripts WHERE script_id = ?`,
        [script_id]
      );
      
      if (!script) {
        throw new Error(`Script con ID ${script_id} no encontrado`);
      }
      
      // Validar que el orden no esté duplicado
      const [existing] = await db.query(
        `SELECT section_id FROM script_sections WHERE script_id = ? AND section_order = ?`,
        [script_id, section_order]
      );
      
      if (existing.length > 0) {
        throw new Error(`Ya existe una sección con el orden ${section_order} en este script`);
      }
      
      const [result] = await db.query(`
        INSERT INTO script_sections (script_id, section_order, section_name, section_text, conditions)
        VALUES (?, ?, ?, ?, ?)
      `, [script_id, section_order, section_name, section_text, conditions || "{}"]);
      
      return {
        section_id: result.insertId,
        script_id,
        section_order,
        section_name,
        section_text,
        conditions: conditions || "{}",
      };
    },

    updateSection: async (_, args, { user }) => {
      // requireQAOrAdmin(user); // Comentado temporalmente - frontend manejará auth
      
      const { section_id, section_name, section_text, conditions } = args;
      
      // Validar que la sección existe
      const [[existingSection]] = await db.query(
        `SELECT * FROM script_sections WHERE section_id = ?`,
        [section_id]
      );
      
      if (!existingSection) {
        throw new Error(`Sección con ID ${section_id} no encontrada`);
      }
      
      // Construir query dinámico solo con los campos que se van a actualizar
      const fields = [];
      const values = [];
      
      if (section_name !== undefined) {
        fields.push("section_name = ?");
        values.push(section_name);
      }
      if (section_text !== undefined) {
        fields.push("section_text = ?");
        values.push(section_text);
      }
      if (conditions !== undefined) {
        fields.push("conditions = ?");
        values.push(conditions);
      }
      
      if (fields.length === 0) {
        throw new Error("Debe proporcionar al menos un campo para actualizar");
      }
      
      values.push(section_id);
      
      await db.query(
        `UPDATE script_sections SET ${fields.join(", ")} WHERE section_id = ?`,
        values
      );
      
      // Retornar la sección actualizada
      const [[updated]] = await db.query(
        `SELECT section_id, script_id, section_order, section_name, section_text, conditions 
         FROM script_sections WHERE section_id = ?`,
        [section_id]
      );
      
      return {
        section_id: updated.section_id,
        script_id: updated.script_id,
        section_order: updated.section_order,
        section_name: updated.section_name,
        section_text: updated.section_text,
        conditions: updated.conditions || "{}",
      };
    },

    deleteSection: async (_, { section_id }, { user }) => {
      // requireQAOrAdmin(user); // Comentado temporalmente - frontend manejará auth
      
      // Validar que la sección existe
      const [[section]] = await db.query(
        `SELECT section_id FROM script_sections WHERE section_id = ?`,
        [section_id]
      );
      
      if (!section) {
        throw new Error(`Sección con ID ${section_id} no encontrada`);
      }
      
      await db.query(`DELETE FROM script_sections WHERE section_id = ?`, [section_id]);
      return true;
    },

    reorderSections: async (_, { script_id, section_orders }, { user }) => {
      // requireQAOrAdmin(user); // Comentado temporalmente - frontend manejará auth
      
      // Validar que el script existe
      const [[script]] = await db.query(
        `SELECT script_id FROM scripts WHERE script_id = ?`,
        [script_id]
      );
      
      if (!script) {
        throw new Error(`Script con ID ${script_id} no encontrado`);
      }
      
      // Validar que todas las secciones pertenecen al script
      const sectionIds = section_orders.map(so => so.section_id);
      const [existingSections] = await db.query(
        `SELECT section_id FROM script_sections WHERE script_id = ? AND section_id IN (${sectionIds.map(() => '?').join(',')})`,
        [script_id, ...sectionIds]
      );
      
      if (existingSections.length !== sectionIds.length) {
        throw new Error("Una o más secciones no pertenecen al script especificado");
      }
      
      // Actualizar el orden de cada sección
      for (const { section_id, section_order } of section_orders) {
        await db.query(
          `UPDATE script_sections SET section_order = ? WHERE section_id = ?`,
          [section_order, section_id]
        );
      }
      
      return true;
    },
  },
};
