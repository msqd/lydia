import * as echartsForReact from "echarts-for-react/lib/core.js";

type EChartsCoreComponent = typeof echartsForReact.default;

/**
 * `echarts-for-react/lib/core.js` is CommonJS: Node ESM hands out its `module.exports`
 * (`{ default: Component }`) as the default import, whereas bundlers unwrap it to the component.
 */
const exported = echartsForReact.default as EChartsCoreComponent | { default: EChartsCoreComponent };

export const ReactEChartsCore: EChartsCoreComponent = typeof exported === "function" ? exported : exported.default;
