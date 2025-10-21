// 🧠 renderEngine.js

export function renderScriptSection(template, ratePlan = {}) {
  if (!template || typeof template !== "string") return "";

  // 1️⃣ Normalizar tipos de servicio (Electric / Gas)
  let serviceTypeText = "";
  if (Array.isArray(ratePlan.Service_Type)) {
    const types = ratePlan.Service_Type.map(t =>
      t === "Electric" ? "electricidad" :
      t === "Gas" ? "gas" : t
    );
    serviceTypeText = types.join(" y ");
  } else if (ratePlan.Service_Type) {
    serviceTypeText =
      ratePlan.Service_Type === "Electric" ? "electricidad" :
      ratePlan.Service_Type === "Gas" ? "gas" :
      ratePlan.Service_Type;
  }

  // 2️⃣ Diccionario de reemplazos automáticos
  const replacements = {
    "\\[RATE\\]": ratePlan.Rate ?? "",
    "\\[UNIT_OF_MEASURE\\]": ratePlan.Unit_of_Measure ?? "",
    "\\[SUPPLIER\\]": ratePlan.Supplier ?? "",
    "\\[DURATION\\]": ratePlan.Term ?? "",
    "\\[TERM\\]": ratePlan.Term ?? "",
    "\\[ETF\\]": ratePlan.ETF ?? "",
    "\\[MSF\\]": ratePlan.MSF ?? "",
    "\\[PRODUCT_NAME\\]": ratePlan.Product_Name ?? "",
    "\\[LDC\\]": ratePlan.LDC ?? "",
    "\\[DBA_NAME\\]": ratePlan.Company_DBA_Name ?? "",
    "\\[AGENT_NAME\\]": ratePlan.Agent_Name ?? "",
    "\\[CUSTOMER_NAME\\]": ratePlan.Customer_Name ?? "",
    "\\[PHONE_NUMBER\\]": ratePlan.Phone ?? "",
    "\\[STATE\\]": ratePlan.State ?? "",
    "\\[COMODITY\\]": serviceTypeText ?? "",
    "\\[BONUS_AMOUNT\\]": ratePlan.BONUS_AMOUNT ?? "",
    "\\[BONUS_TOTAL\\]": ratePlan.BONUS_TOTAL ?? "",
    "\\[UTILITY_NAME\\]": ratePlan.Standard_Utility_Name ?? "",
  };

  // 3️⃣ Aplicar reemplazos globales
  let rendered = template;
  for (const [pattern, value] of Object.entries(replacements)) {
    rendered = rendered.replace(new RegExp(pattern, "g"), value);
  }

  // 4️⃣ Limpieza final del texto
  return rendered
    .replace(/\s{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
