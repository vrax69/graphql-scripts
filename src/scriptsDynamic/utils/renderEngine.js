export function renderScriptSection(template, ratePlan) {
  if (!template || !ratePlan) return "";

  return template
    .replace(/\[RATE\]/g, ratePlan.rate)
    .replace(/\[UNIT_OF_MEASURE\]/g, ratePlan.unit_of_measure)
    .replace(/\[SUPPLIER\]/g, ratePlan.supplier)
    .replace(/\[DURATION\]/g, ratePlan.duration)
    .replace(/\[ETF\]/g, ratePlan.etf)
    .replace(/\[MSF\]/g, ratePlan.msf)
    .replace(/\[PRODUCT_NAME\]/g, ratePlan.product_name)
    .replace(/\[LDC\]/g, ratePlan.ldc)
    .replace(/\[DBA_NAME\]/g, ratePlan.company_dba_name);
}
