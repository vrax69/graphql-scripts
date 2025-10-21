// src/scriptsDynamic/dynamicSchema.js
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
    TPV_ID: String
    User_ID: String
    Email: String
    LDC: String
    Company_DBA_Name: String
    ETF: String
    MSF: String
    Language: String
    Customer_Name: String
    Phone: String
  }

  type Query {
    renderedScript(script_id: ID!, rateContext: RateContextInput!): RenderedScript
  }
`;
