// src/scriptsDynamic/dynamicSchema.js
export const typeDefs = `#graphql
  scalar JSON

  type RenderedSection {
    section_id: ID
    section_name: String
    rendered_text: String
  }

  type RenderedScript {
    script_id: ID
    script_title: String
    provider_name: String
    language: String
    channel: String
    sections: [RenderedSection]
  }

  input RateContextInput {
  Supplier: String
  Product_Name: String
  Rate: String
  Term: String
  Unit_of_Measure: String
  Service_Type: [String]
  State: String
  Agent_Name: String
  Customer_Name: String
  TPV_ID: String
  User_ID: String
  Phone: String
  Email: String
  LDC: String
  Company_DBA_Name: String
  ETF: String
  MSF: String
  Language: String

  # 🆕 NUEVOS CAMPOS
  Standard_Utility_Name: String
  BONUS_AMOUNT: String
  BONUS_TOTAL: String
}


  type Query {
    renderedScript(script_id: ID!, rateContext: RateContextInput!): RenderedScript
    # 🔧 Queries para QA - Panel de edición
    scriptsList: [ScriptInfo]
    scriptSections(script_id: ID!): [SectionInfo]
    sectionDetails(section_id: ID!): SectionInfo
  }

  type ScriptInfo {
    script_id: ID
    script_title: String
    provider_name: String
    language: String
    channel: String
    total_sections: Int
  }

  type SectionInfo {
    section_id: ID
    script_id: ID
    section_order: Int
    section_name: String
    section_text: String
    conditions: JSON
  }

  type Mutation {
    # 🔧 Mutations para QA - Edición de scripts
    createSection(
      script_id: ID!
      section_order: Int!
      section_name: String!
      section_text: String!
      conditions: String
    ): SectionInfo

    updateSection(
      section_id: ID!
      section_name: String
      section_text: String
      conditions: String
    ): SectionInfo

    deleteSection(section_id: ID!): Boolean

    reorderSections(
      script_id: ID!
      section_orders: [SectionOrderInput!]!
    ): Boolean
  }

  input SectionOrderInput {
    section_id: ID!
    section_order: Int!
  }
`;
