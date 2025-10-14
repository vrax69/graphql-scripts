// dynamicSchema.js
export const typeDefs = `#graphql
  type RenderedSection {
    section_id: ID
    section_name: String
    rendered_text: String
  }

  type RenderedScript {
    script_id: ID
    script_title: String
    provider_name: String
    sections: [RenderedSection]
  }

  input RateContextInput {
    Rate: String
    Term: String
    Unit_of_Measure: String
    State: String
    Service_Type: String
    Supplier: String
  }

  type Query {
    renderedScript(script_id: ID!, rateContext: RateContextInput!): RenderedScript
  }
`;