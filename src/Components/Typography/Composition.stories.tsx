import type { Meta } from "@storybook/react-vite";
import { P } from "./Paragraphs";
import { Section } from "./Section";
import { H1, H2, H3 } from "./Titles";

const meta = {
  title: "Components/Typography/Composition",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;

export const TitlesWithParagraphs = () => (
  <>
    <Section>
      <H1>Eat at Joe's</H1>
      <P>So good you won't believe it's real.</P>
    </Section>

    <Section>
      <H2>Joe's special</H2>
      <P>It's a secret, but it's good.</P>
    </Section>

    <Section>
      <H3>Joe's special with cheese</H3>
      <P>It's a secret, but it's good. And it has cheese.</P>
      <P>And even a second paragraph. What would you want more?</P>
      <P>Lovely Spam! (Lovely Spam!) Lovely Spam! (Lovely Spam!) Lovely Spam! Spam, Spam, Spam, Spam!</P>
    </Section>
  </>
);

export const DocumentExample = () => (
  <div className="max-w-3xl mx-auto">
    <Section>
      <H1>The Art of Typography in Web Design</H1>
      <P>Typography is a fundamental aspect of web design that can make or break user experience.</P>
    </Section>

    <Section>
      <H2>Importance of Readability</H2>
      <P>
        Readability is crucial for ensuring that users can easily consume your content. Choose font sizes, line heights,
        and spacing that make text comfortable to read.
      </P>
      <P>The optimal line length for readability is generally considered to be 50-75 characters, including spaces.</P>
    </Section>

    <Section>
      <H3>Font Selection</H3>
      <P>
        Choose fonts that align with your brand identity and are legible across different screen sizes and devices.
        Consider using a system font stack for better performance.
      </P>
    </Section>

    <Section>
      <H3>Visual Hierarchy</H3>
      <P>
        Create clear visual hierarchy with different heading levels to guide users through your content and make it
        scannable.
      </P>
      <P>Use size, weight, color, and spacing to establish relationships between different text elements.</P>
    </Section>
  </div>
);
