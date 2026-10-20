import { tpdexScale } from "@msqd/lydia/Models/Tpdex";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { contrast } from "../../../.storybook/contrast";
import { TpdexBadge } from "./TpdexBadge";

const meta = {
  title: "Elements/Tpdex/TpdexBadge",
  component: TpdexBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
TpdexBadge displays transaction performance ratings based on response times or pre-calculated scores.

TPDEX (Transaction Performance Index) converts response times into a 0-100 score with letter grades:
- A++/A+/A: Excellent performance (93-100)
- B: Good performance (83-92)
- C: Fair performance (69-82)
- D: Poor performance (49-68)
- E: Bad performance (31-48)
- F: Very bad performance (17-30)
- G: Unacceptable performance (0-16)

**Measured and estimated scores do not look alike.** A transaction that has not ended carries no
score, so the badge estimates one from the response time and marks it with a leading \`~\` and a
dashed outline. That matters because filtering treats an unscored transaction as matching no
bounded range: without the marker, a user reads an \`A\`, filters for 90 and above, and watches the
row disappear with nothing on screen explaining why.

Pass \`score\` only when the score was measured. Supplying it is what tells the badge which claim
it is making.
        `,
      },
    },
  },
  argTypes: {
    score: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description:
        "Measured TPDEX score (0-100). Supplying it marks the badge as a measurement; omitting it marks the badge as an estimate derived from responseTime.",
    },
    responseTime: {
      control: { type: "number", min: 0, max: 10000, step: 10 },
      description: "Response time in milliseconds to calculate TPDEX score from.",
    },
    showScore: {
      control: "boolean",
      description: "Whether to show the numeric score alongside the rating label.",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply.",
    },
  },
  args: {
    score: 90,
    showScore: false,
  },
} satisfies Meta<typeof TpdexBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    score: 90,
  },
};

export const WithScore: Story = {
  args: {
    score: 85,
    showScore: true,
  },
};

export const FromResponseTime: Story = {
  args: {
    responseTime: 150,
    showScore: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Badge calculated from response time (150ms → score 91 → A rating)",
      },
    },
  },
};

export const AllRatings: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "All possible TPDEX ratings from A++ (excellent) to G (unacceptable)",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3 p-6 bg-gray-50 rounded-lg">
      <div className="w-full text-sm font-medium text-gray-700 mb-2">All TPDEX Ratings</div>
      {tpdexScale.map((rating) => {
        // Use the threshold or a representative score for that rating
        const score = rating.threshold ?? 5;
        return (
          <div key={rating.label} className="flex flex-col items-center gap-1">
            <TpdexBadge score={score} showScore={true} />
            <div className="text-xs text-gray-500">{rating.label}</div>
          </div>
        );
      })}
    </div>
  ),
};

export const ResponseTimeExamples: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Examples showing how different response times map to TPDEX scores and ratings",
      },
    },
  },
  render: () => (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
      <div className="text-sm font-medium text-gray-700 mb-4">Response Time → TPDEX Rating</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { time: 25, description: "Very fast" },
          { time: 100, description: "Fast" },
          { time: 250, description: "Good" },
          { time: 500, description: "Acceptable" },
          { time: 1000, description: "Slow" },
          { time: 2000, description: "Very slow" },
          { time: 5000, description: "Extremely slow" },
        ].map(({ time, description }) => (
          <div key={time} className="bg-white p-3 rounded border flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{time}ms</div>
              <div className="text-xs text-gray-500">{description}</div>
            </div>
            <TpdexBadge responseTime={time} showScore={true} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {
    score: 90,
    className: "shadow-lg border-2 border-white",
  },
  parameters: {
    docs: {
      description: {
        story: "Custom styling can be applied via className prop",
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    responseTime: 200,
    showScore: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Try changing the response time or score in the controls to see how the badge updates",
      },
    },
  },
};

export const MeasuredVersusEstimated: Story = {
  args: { score: 96 },
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <TpdexBadge score={96} />
        <span className="text-xs text-gray-500">measured</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TpdexBadge responseTime={50} />
        <span className="text-xs text-gray-500">estimated</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The same grade, one measured and one estimated. Both claims exist for good reasons; what they must not do is look alike. The tilde and the dashed outline are the distinction, and neither depends on colour.",
      },
    },
  },
};

export const InAList: Story = {
  args: { score: 96 },
  render: () => (
    <table className="text-sm">
      <tbody>
        {[
          { endpoint: "/api/users", score: 98, responseTime: 15, status: "Successful" },
          { endpoint: "/api/orders", score: undefined, responseTime: 65, status: "Pending" },
          { endpoint: "/api/products", score: 87, responseTime: 180, status: "Successful" },
          { endpoint: "/api/payments", score: undefined, responseTime: 340, status: "Pending" },
          { endpoint: "/api/search", score: 43, responseTime: 1200, status: "Successful" },
        ].map((row) => (
          <tr key={row.endpoint}>
            <td className="py-1 pr-3">
              <TpdexBadge score={row.score} responseTime={row.responseTime} />
            </td>
            <td className="py-1 pr-3 font-mono text-xs text-gray-500">{row.endpoint}</td>
            <td className="py-1 text-xs text-gray-500">{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The case that matters: a dense column at the size the transactions list renders. The two still-running rows are identifiable as estimates without reading the status column, which is the test of whether the marker survives being small and repeated.",
      },
    },
  },
};

export const InGreyscale: Story = {
  args: { score: 96 },
  render: () => (
    <div className="grayscale flex items-center gap-3">
      <TpdexBadge score={98} />
      <TpdexBadge responseTime={15} />
      <TpdexBadge score={43} />
      <TpdexBadge responseTime={1200} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "WCAG 1.4.1: colour is not the carrier. Desaturated, the grades themselves become hard to tell apart, and the measured-versus-estimated distinction does not, because it is made of a character and an outline.",
      },
    },
  },
};

/**
 * Every rating's label is readable: 4.5:1 between the text and its fill, which
 * WCAG 1.4.3 asks of text this small. Measured in a browser, each colour painted
 * to a canvas, since no rule in this repository looks at it otherwise.
 */
export const EveryRatingIsReadable: Story = {
  args: { score: 96 },
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {tpdexScale.map((rating) => (
        <TpdexBadge key={rating.label} data-testid={`rating-${rating.label}`} score={rating.threshold ?? 0} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const ratios = tpdexScale.map((rating) => {
      const badge = canvasElement.querySelector(`[data-testid="rating-${rating.label}"]`);
      if (!badge) throw new Error(`no ${rating.label} badge drawn`);
      const style = getComputedStyle(badge);
      return `${rating.label} ${contrast(style.color, style.backgroundColor).toFixed(2)}:1`;
    });
    const short = ratios.filter((reading) => Number.parseFloat(reading.split(" ")[1]) < 4.5);
    await expect(short, `all: ${ratios.join(", ")}`).toEqual([]);
  },
};
