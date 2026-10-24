import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";

import { Paginator } from "./Paginator";

const meta = {
  title: "Components/DataTable/Paginator",
  component: Paginator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    pages: { control: { type: "number", min: 1, max: 100 } },
    current: { control: { type: "number", min: 1, max: 50 } },
    perPage: { control: { type: "number", min: 1, max: 100 } },
    total: { control: { type: "number", min: 0 } },
    showSummary: { control: { type: "boolean" } },
    setPage: { action: "page changed" },
  },
} satisfies Meta<typeof Paginator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pages: 10,
    current: 1,
    perPage: 20,
    total: 200,
    showSummary: true,
  },
};

export const WithoutSummary: Story = {
  args: {
    pages: 10,
    current: 1,
    perPage: 20,
    total: 200,
    showSummary: false,
  },
};

export const MiddlePage: Story = {
  args: {
    pages: 10,
    current: 5,
    perPage: 20,
    total: 200,
    showSummary: true,
  },
};

export const LastPage: Story = {
  args: {
    pages: 10,
    current: 10,
    perPage: 20,
    total: 200,
    showSummary: true,
  },
};

export const Empty: Story = {
  args: {
    total: 0,
  },
};

export const NamedByAHeading: Story = {
  render: (args) => (
    <>
      <h2 id="paginator-story-title">Errors</h2>
      <Paginator {...args} />
    </>
  ),
  args: {
    pages: 10,
    current: 1,
    perPage: 20,
    total: 200,
    label: "pagination",
    labelledBy: "paginator-story-title",
  },
};

export const ManyPages: Story = {
  args: {
    pages: 50,
    current: 25,
    perPage: 10,
    total: 500,
    showSummary: true,
  },
};

// Interactive story with working page selection
const InteractivePaginatorTemplate = (args: React.ComponentProps<typeof Paginator>) => {
  const [currentPage, setCurrentPage] = useState(args.current || 1);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-2">
        <p className="text-lg font-medium">Current page: {currentPage}</p>
        <p className="text-sm text-gray-500">Click on page numbers to navigate</p>
      </div>
      <Paginator {...args} current={currentPage} setPage={(page) => setCurrentPage(page)} />
    </div>
  );
};

export const Interactive: Story = {
  render: InteractivePaginatorTemplate,
  args: {
    pages: 10,
    perPage: 10,
    total: 100,
    showSummary: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A fully interactive paginator that lets you change pages by clicking on the page numbers or navigation buttons.",
      },
    },
  },
};
