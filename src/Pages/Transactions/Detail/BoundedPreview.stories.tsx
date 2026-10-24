import { Button } from "@msqd/lydia/Components/Buttons";
import { CodeFormatter } from "@msqd/lydia/Components/Formatter";
import { Foldable } from "@msqd/lydia/Components/Utilities/Foldable";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { DownloadButton } from "./Components/DownloadButton";

/*
 * Mockup for validation (#57): static props, no behaviour. The real implementation replaces the
 * local `BodyNotice` and `BodyMockup`; this file is rewritten or deleted with it.
 */

const HIGHLIGHTED = JSON.stringify(
  { id: 42, name: "Ada", roles: ["admin", "dev"], active: true, address: { city: "London", zip: "N1 9GU" } },
  null,
  2,
);

const PLAIN = JSON.stringify(
  Array.from({ length: 40 }, (_, i) => ({ id: i, sku: `SKU-${1000 + i}`, price: 9.99 + i, stock: i * 3 })),
  null,
  2,
);

const MINIFIED = `<!doctype html><html><head><title>Catalog</title><script>window.__DATA__=${"[0,1,2,3,4,5,6,7,8,9]".repeat(40)}</script></head><body>${'<div class="row"><span>item</span><a href="/p/1">link</a></div>'.repeat(40)}`;

interface NoticeProps {
  children: ReactNode;
  action?: ReactNode;
}

function BodyNotice({ children, action }: NoticeProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-md border border-b-0 border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <p role="status">{children}</p>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

interface BodyMockupProps {
  /** Whether the section is open when the drawer opens. */
  defaultOpen: boolean;
  size: string;
  children: ReactNode;
}

function BodyMockup({ defaultOpen, size, children }: BodyMockupProps) {
  return (
    <div className="w-[34rem] max-w-full bg-white px-4 py-3">
      <Foldable title="Response" defaultOpen={defaultOpen}>
        <div className="mb-2 flex items-center justify-between">
          <h6 className="text-sm font-medium text-gray-900">Body</h6>
          <span className="text-xs text-gray-500">{size}</span>
        </div>
        {children}
      </Foldable>
    </div>
  );
}

function PreviewActions() {
  return (
    <>
      <Button variant="secondary" size="sm">
        Show all
      </Button>
      <DownloadButton data={MINIFIED} filename="response.html" mimeType="text/html" variant="secondary" />
    </>
  );
}

function PreviewText() {
  return (
    <pre
      tabIndex={0}
      aria-label="Body preview"
      className="max-h-60 overflow-auto whitespace-pre-wrap break-all rounded-b-md border border-gray-200 bg-white p-3 font-mono text-xs leading-5"
    >
      {MINIFIED}
    </pre>
  );
}

const meta = {
  title: "Pages/Transactions/Detail/Bounded preview (mockup)",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Mockup of the body states of #57, for validation. Static: caps are 100 KB (highlight), 2 MB (reformat), 64 KB (preview).",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Highlighted: Story = {
  name: "1. Highlighted (up to 100 KB)",
  render: () => (
    <BodyMockup defaultOpen size="1.2 KB">
      <CodeFormatter code={HIGHLIGHTED} language="json" maxHeight={240} />
    </BodyMockup>
  ),
};

export const HighlightPending: Story = {
  name: "1b. Highlighted, still painting",
  parameters: {
    docs: {
      description: {
        story: "First paint of state 1: the drawer opens with plain text, tokens colour in on the next frame.",
      },
    },
  },
  render: () => (
    <BodyMockup defaultOpen size="1.2 KB">
      <CodeFormatter code={HIGHLIGHTED} language="text" maxHeight={240} />
    </BodyMockup>
  ),
};

export const Plain: Story = {
  name: "2. Plain (100 KB to 2 MB)",
  render: () => (
    <BodyMockup defaultOpen size="640 KB">
      <BodyNotice>Too large to highlight: shown as plain text.</BodyNotice>
      <CodeFormatter code={PLAIN} language="text" maxHeight={240} className="rounded-t-none" />
    </BodyMockup>
  ),
};

export const Preview: Story = {
  name: "3. Preview (over 2 MB, section collapsed)",
  parameters: {
    docs: {
      description: {
        story: "The section starts collapsed: open Response to see the preview.",
      },
    },
  },
  render: () => (
    <BodyMockup defaultOpen={false} size="5.0 MB">
      <BodyNotice action={<PreviewActions />}>Showing the first 64 KB of 5.0 MB.</BodyNotice>
      <PreviewText />
    </BodyMockup>
  ),
};

export const PreviewOpen: Story = {
  name: "3b. Preview, section opened",
  render: () => (
    <BodyMockup defaultOpen size="5.0 MB">
      <BodyNotice action={<PreviewActions />}>Showing the first 64 KB of 5.0 MB.</BodyNotice>
      <PreviewText />
    </BodyMockup>
  ),
};

export const Expanded: Story = {
  name: "4. Expanded (after Show all)",
  render: () => (
    <BodyMockup defaultOpen size="5.0 MB">
      <BodyNotice
        action={
          <>
            <Button variant="secondary" size="sm">
              Show preview only
            </Button>
            <DownloadButton data={MINIFIED} filename="response.html" mimeType="text/html" variant="secondary" />
          </>
        }
      >
        Showing all 5.0 MB as plain text, not reformatted.
      </BodyNotice>
      <CodeFormatter code={MINIFIED} language="text" maxHeight={240} className="rounded-t-none" />
    </BodyMockup>
  ),
};
