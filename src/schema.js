import { gql } from "graphql-tag";
import { userTypeDefs } from "./users/userSchema.js";
import { scriptTypeDefs } from "./scripts/scriptSchema.js";

export const typeDefs = [
  gql`
    type RateView {
      Rate_ID: String
      Standard_Utility_Name: String
      Product_Name: String
      Rate: Float
      ETF: String
      MSF: String
      duracion_rate: String
      Company_DBA_Name: String
      Last_Updated: String
      SPL: String
      State: String
      LDC: String
      Logo_URL: String
      Service_Type: String
      Unit_of_Measure: String
      Excel_Status: String
      utility_contact: String
    }

    type Query {
      rates(limit: Int): [RateView]
    }
  `,
  userTypeDefs,
  scriptTypeDefs, // ✅ AGREGA ESTA LÍNEA
];
