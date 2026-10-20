import type { Meta, StoryObj } from "@storybook/react-vite";
import { JsonTreeView } from "./JsonTreeView";

const meta: Meta<typeof JsonTreeView> = {
  title: "Components/Formatter/JsonTreeView",
  component: JsonTreeView,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    data: {
      control: "object",
    },
    initiallyExpanded: {
      control: "boolean",
    },
    expandedDepth: {
      control: {
        type: "range",
        min: 0,
        max: 10,
        step: 1,
      },
    },
    onValueClick: {
      action: "valueClicked",
    },
  },
  args: {
    data: {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      isActive: true,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
      tags: ["developer", "frontend"],
      projects: [
        {
          id: 1,
          name: "Project A",
          tasks: [
            { id: 101, title: "Task 1", completed: true },
            { id: 102, title: "Task 2", completed: false },
          ],
        },
        {
          id: 2,
          name: "Project B",
          tasks: [{ id: 201, title: "Task 1", completed: false }],
        },
      ],
      metadata: {
        lastLogin: "2023-05-15T10:30:00Z",
        preferences: {
          theme: "dark",
          notifications: {
            email: true,
            push: false,
          },
        },
      },
    },
    initiallyExpanded: false,
    expandedDepth: 1,
  },
};

export default meta;

type Story = StoryObj<typeof JsonTreeView>;

export const Default: Story = {};

export const InitiallyExpanded: Story = {
  args: {
    initiallyExpanded: true,
  },
};

export const CustomExpandedDepth: Story = {
  args: {
    expandedDepth: 2, // Show 2 levels expanded
  },
};

export const SimpleObject: Story = {
  args: {
    data: {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      isActive: true,
    },
  },
};

export const SimpleArray: Story = {
  args: {
    data: [1, 2, 3, "four", false, null, { key: "value" }],
  },
};

export const DeepNestedObject: Story = {
  args: {
    data: {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: "Deep nested value",
            },
          },
        },
      },
    },
    expandedDepth: 3, // Show 3 levels expanded
  },
};

export const WithNullValues: Story = {
  args: {
    data: {
      name: "John",
      address: null,
      account: undefined,
      active: true,
      tokens: [],
    },
  },
};

export const LargeDataset: Story = {
  args: {
    data: (() => {
      // Generate a large dataset with 100 items
      const result: { items: object[] } = { items: [] };
      for (let i = 0; i < 100; i++) {
        result.items.push({
          id: i,
          name: `Item ${i}`,
          value: Math.floor(Math.random() * 1000),
          active: Math.random() > 0.5,
        });
      }
      return result;
    })(),
  },
};

export const APIResponse: Story = {
  args: {
    data: {
      status: "success",
      code: 200,
      data: {
        users: [
          {
            id: 1,
            name: "John Smith",
            email: "john@example.com",
            role: "admin",
            metadata: {
              lastLogin: "2023-05-10T08:30:00Z",
              loginCount: 42,
            },
          },
          {
            id: 2,
            name: "Jane Doe",
            email: "jane@example.com",
            role: "user",
            metadata: {
              lastLogin: "2023-05-11T14:22:00Z",
              loginCount: 16,
            },
          },
        ],
        pagination: {
          total: 25,
          page: 1,
          perPage: 10,
          totalPages: 3,
        },
      },
    },
    expandedDepth: 3,
  },
};
