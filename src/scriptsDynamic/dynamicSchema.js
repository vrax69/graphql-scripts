import { gql } from "graphql-tag";

export const dynamicTypeDefs = gql`
  type RatePlan {
    rate_id: ID!
    product_name: String
    supplier: String
    state: String
    service_type: String
    rate: Float
    etf: String
    msf: String
    duration: String
    company_dba_name: String
    ldc: String
    unit_of_measure: String
    logo_url: String
    utility_contact: String
  }

  type ScriptSection {
    section_id: ID!
    order: Int
    title: String
    content_template: String
    required_variables: [String]
  }

  type ScriptTemplate {
    template_id: ID!
    script_title: String
    supplier: String
    state: String
    channel: String
    language: String
    sections: [ScriptSection]
  }

  type RenderedScript {
    template_id: ID!
    script_title: String
    supplier: String
    state: String
    channel: String
    language: String
    sections: [RenderedSection]
  }

  type RenderedSection {
    section_id: ID!
    order: Int
    title: String
    rendered_content: String
    required_variables: [String]
  }

  input ScriptSectionInput {
    section_id: ID!
    title: String
    content_template: String
  }

  type Query {
    ratePlans(state: String!, supplier: String!): [RatePlan]
    scriptTemplate(supplier: String!, state: String!, channel: String!, language: String!): ScriptTemplate
    renderedScript(supplier: String!, state: String!, channel: String!, language: String!, rateId: ID!): RenderedScript
  }

  type Mutation {
    updateScriptSection(input: ScriptSectionInput!): ScriptSection
  }
`;
