import type { Meta, StoryObj } from "@storybook/react-vite";
import { P } from "./Paragraphs";
import { Section } from "./Section";
import { H1, H2, H3, H4, H5, H6 } from "./Titles";

const meta = {
  title: "Components/Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  component: P,
} satisfies Meta<typeof P>;

export default meta;

type Story = StoryObj<typeof P>;

export const Paragraph: Story = {
  args: {
    children: "This is a paragraph component styled with TailwindCSS.",
  },
};

export const CustomParagraph: Story = {
  args: {
    children: "This is a custom paragraph with additional classes.",
    className: "italic text-primary-700 font-semibold",
  },
};

export const Titles = () => (
  <>
    <H1>A big title</H1>
    <H2>Still a big title, but not so much</H2>
    <H3>A less pretentious title</H3>
    <H4>Quite an humble title</H4>
    <H5>Getting timid</H5>
    <H6>Or very discret</H6>
  </>
);

const HR = () => <hr style={{ margin: 0, padding: 0, border: "1px solid black" }} />;

export const TitlesWithParagraphs = ({ withHr = false }) => (
  <>
    {withHr ? <HR /> : null}

    <Section>
      <H1>Eat at Joe's</H1>
      <P>So good you won't believe it's real.</P>
    </Section>

    {withHr ? <HR /> : null}

    <Section>
      <H2>Joe's special</H2>
      <P>It's a secret, but it's good.</P>
    </Section>

    {withHr ? <HR /> : null}

    <Section>
      <H3>Joe's special with cheese</H3>
      <P>It's a secret, but it's good. And it has cheese.</P>
      <P>And even a second paragraph. What would you want more?</P>
      <P>Lovely Spam! (Lovely Spam!) Lovely Spam! (Lovely Spam!) Lovely Spam! Spam, Spam, Spam, Spam!</P>
    </Section>

    {withHr ? <HR /> : null}
  </>
);

TitlesWithParagraphs.args = {
  withHr: false,
};
TitlesWithParagraphs.argTypes = {};

export const FontShowcase = () => (
  <Section>
    <H2>Lato Font Family Showcase</H2>
    <div className="space-y-6">
      {/* Regular Weight */}
      <div>
        <H3>Regular (400)</H3>
        <P className="font-normal">
          The quick brown fox jumps over the lazy dog. This text demonstrates Lato's regular weight. Lato is a humanist
          sans-serif typeface designed by Łukasz Dziedzic and published by his foundry tyPoland in 2010.
        </P>
      </div>

      {/* Bold Weight */}
      <div>
        <H3>Bold (700)</H3>
        <P className="font-bold">
          The quick brown fox jumps over the lazy dog. This text demonstrates Lato's bold weight. Lato is a humanist
          sans-serif typeface designed by Łukasz Dziedzic and published by his foundry tyPoland in 2010.
        </P>
      </div>

      {/* Italic Style */}
      <div>
        <H3>Italic (400)</H3>
        <P className="italic">
          The quick brown fox jumps over the lazy dog. This text demonstrates Lato's italic style. Lato is a humanist
          sans-serif typeface designed by Łukasz Dziedzic and published by his foundry tyPoland in 2010.
        </P>
      </div>

      {/* Bold Italic */}
      <div>
        <H3>Bold Italic (700)</H3>
        <P className="font-bold italic">
          The quick brown fox jumps over the lazy dog. This text demonstrates Lato's bold italic style. Lato is a
          humanist sans-serif typeface designed by Łukasz Dziedzic and published by his foundry tyPoland in 2010.
        </P>
      </div>

      {/* Font Stack Demonstration */}
      <div>
        <H3>Font Stack Information</H3>
        <P className="text-sm text-gray-600 font-mono">
          font-family: Lato, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica
          Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color
          Emoji";
        </P>
        <P className="mt-2">
          This demonstrates the complete fallback chain. If Lato fails to load, the browser will progressively fall back
          through the system fonts to ensure readability.
        </P>
      </div>

      {/* Size Variations */}
      <div>
        <H3>Size Variations</H3>
        <div className="space-y-2">
          <div className="text-xs">Extra Small Text (xs)</div>
          <div className="text-sm">Small Text (sm)</div>
          <div className="text-base">Base Text (base)</div>
          <div className="text-lg">Large Text (lg)</div>
          <div className="text-xl">Extra Large Text (xl)</div>
          <div className="text-2xl">2X Large Text (2xl)</div>
        </div>
      </div>
    </div>
  </Section>
);
