import { ResponseStatusBadge } from "@msqd/lydia/Elements/Http/ResponseStatusBadge";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Elements/Http/ResponseStatus",
  component: ResponseStatusBadge,
  tags: ["autodocs"],
  argTypes: {
    statusCode: {
      control: { type: "number", min: 100, max: 599 },
      description: "HTTP status code",
    },
    showReason: {
      control: { type: "boolean" },
      description: "Spell the reason phrase out beside the code",
    },
  },
  args: {
    statusCode: 200,
  },
} satisfies Meta<typeof ResponseStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    statusCode: 200,
  },
};

export const Unknown: Story = {
  args: {
    statusCode: 999, // A non-standard status code for testing the unknown case
  },
};

/**
 * The code alone, for a badge that appears once per row.
 *
 * Colour already says the class and the number already says the code, so the
 * phrase is the same words on every row of a kind — and it takes width from
 * whatever identifies the row. Keep the phrase where there is one badge and a
 * reader may not know what 422 means.
 */
export const CodeOnly: Story = {
  args: {
    statusCode: 500,
    showReason: false,
  },
};

/** The two side by side, which is the choice a consumer is actually making. */
export const WithAndWithoutTheReason: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">A detail panel: one of them, so the phrase earns its width</h3>
        <div className="flex flex-wrap gap-2">
          <ResponseStatusBadge statusCode={500} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">A list: the phrase repeats down the page</h3>
        <div className="flex flex-col items-start gap-1">
          <ResponseStatusBadge statusCode={200} showReason={false} />
          <ResponseStatusBadge statusCode={200} showReason={false} />
          <ResponseStatusBadge statusCode={404} showReason={false} />
          <ResponseStatusBadge statusCode={500} showReason={false} />
          <ResponseStatusBadge statusCode={200} showReason={false} />
        </div>
      </div>
    </div>
  ),
};

export const All: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">2xx Success</h3>
        <div className="flex flex-wrap gap-2">
          <ResponseStatusBadge statusCode={200} />
          <ResponseStatusBadge statusCode={201} />
          <ResponseStatusBadge statusCode={204} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">3xx Redirection</h3>
        <div className="flex flex-wrap gap-2">
          <ResponseStatusBadge statusCode={301} />
          <ResponseStatusBadge statusCode={302} />
          <ResponseStatusBadge statusCode={304} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">4xx Client Error</h3>
        <div className="flex flex-wrap gap-2">
          <ResponseStatusBadge statusCode={400} />
          <ResponseStatusBadge statusCode={401} />
          <ResponseStatusBadge statusCode={403} />
          <ResponseStatusBadge statusCode={404} />
          <ResponseStatusBadge statusCode={422} />
          <ResponseStatusBadge statusCode={429} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">5xx Server Error</h3>
        <div className="flex flex-wrap gap-2">
          <ResponseStatusBadge statusCode={500} />
          <ResponseStatusBadge statusCode={502} />
          <ResponseStatusBadge statusCode={503} />
          <ResponseStatusBadge statusCode={504} />
        </div>
      </div>
    </div>
  ),
};
