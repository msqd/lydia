import { renderToString } from "react-dom/server";
import { App } from "./App.js";
import { charts } from "./charts.js";

export const html = renderToString(<App />);
export const chartHtml = Object.fromEntries(
  Object.entries(charts).map(([name, chart]) => [name, renderToString(chart)]),
);
