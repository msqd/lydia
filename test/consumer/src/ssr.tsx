import { renderToString } from "react-dom/server";
import { App } from "./App";
import { charts } from "./charts";

export const html = renderToString(<App />);
export const chartHtml = Object.fromEntries(
  Object.entries(charts).map(([name, chart]) => [name, renderToString(chart)]),
);
