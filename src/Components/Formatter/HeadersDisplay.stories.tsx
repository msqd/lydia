import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeadersDisplay } from "./HeadersDisplay";

const meta = {
  title: "Components/Formatter/HeadersDisplay",
  component: HeadersDisplay,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeadersDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headers: [
      { name: "Content-Type", value: "application/json" },
      { name: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
      { name: "User-Agent", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      { name: "Accept", value: "application/json" },
      { name: "X-Request-ID", value: "req-12345" },
    ],
  },
};

export const EmptyHeaders: Story = {
  args: {
    headers: [],
  },
};

export const SingleHeader: Story = {
  args: {
    headers: [{ name: "Content-Type", value: "application/json" }],
  },
};

/**
 * A login response setting three cookies. A map-shaped prop would show one of these; all three
 * crossed the wire and all three are shown, in the order the server sent them.
 */
export const RepeatedSetCookie: Story = {
  args: {
    headers: [
      { name: "Date", value: "Fri, 15 Aug 2026 09:12:44 GMT" },
      { name: "Content-Type", value: "application/json; charset=utf-8" },
      { name: "set-cookie", value: "session=b7f3a1c9; Path=/; HttpOnly; Secure; SameSite=Lax" },
      { name: "set-cookie", value: "csrf=9d2e4f81; Path=/; Secure; SameSite=Strict" },
      { name: "set-cookie", value: "locale=en-GB; Path=/; Max-Age=31536000" },
      { name: "Cache-Control", value: "no-store" },
    ],
  },
};

/**
 * `Set-Cookie` and `set-cookie` are distinct entries here rather than one. Header names are
 * case-insensitive in HTTP, but this component shows what arrived rather than normalising it.
 */
export const CaseVaryingRepeat: Story = {
  args: {
    headers: [
      { name: "Set-Cookie", value: "first=1; Path=/" },
      { name: "set-cookie", value: "second=2; Path=/" },
      { name: "SET-COOKIE", value: "third=3; Path=/" },
    ],
  },
};

/**
 * Supplied deliberately out of alphabetical order, and rendered in exactly that order.
 */
export const UnsortedOrderPreserved: Story = {
  args: {
    headers: [
      { name: "X-Trace-Id", value: "abc-123" },
      { name: "Content-Type", value: "text/plain" },
      { name: "Age", value: "42" },
      { name: "Server", value: "harp/1.0" },
      { name: "Accept-Ranges", value: "bytes" },
    ],
  },
};

export const LongValues: Story = {
  args: {
    headers: [
      {
        name: "Authorization",
        value:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      },
      {
        name: "User-Agent",
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      { name: "Accept", value: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" },
    ],
  },
};
