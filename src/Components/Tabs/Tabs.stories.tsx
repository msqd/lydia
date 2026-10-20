import { Button } from "@msqd/lydia/Components/Buttons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { TabPanel, Tabs } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    tabs: {
      control: "object",
      description: "List of tabs to display",
    },
    defaultIndex: {
      control: { type: "number", min: 0 },
      description: "Index of the default selected tab",
    },
    selectedIndex: {
      control: { type: "number", min: 0 },
      description: "Index of the selected tab (controlled mode)",
    },
    onChange: {
      action: "changed",
      description: "Function called when a tab is selected",
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Example data for stories
// Note: In a real application, tab href attributes can be used to
// navigate or preserve state in the URL. In Storybook, navigation is disabled
// to avoid disrupting the presentation interface.
const exampleTabs = [
  { id: "account", name: "My Account", href: "#account" },
  { id: "company", name: "Company", href: "#company" },
  { id: "team", name: "Team Members", href: "#team" },
  { id: "billing", name: "Billing", href: "#billing", disabled: true },
];

export const Default: Story = {
  args: {
    tabs: exampleTabs,
    onChange: fn(),
  },
  render: (args) => (
    <div>
      <Tabs {...args}>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">My Account</h3>
            <p className="mt-2 text-gray-700">Manage your account settings and preferences.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Company</h3>
            <p className="mt-2 text-gray-700">View and update your company information.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <p className="mt-2 text-gray-700">Manage your team members and their access permissions.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Billing</h3>
            <p className="mt-2 text-gray-700">Manage your subscription and payment information.</p>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

export const WithCustomStyles: Story = {
  args: {
    tabs: exampleTabs,
    className: "border rounded-md bg-gray-50 p-4",
    tabListClassName: "bg-white rounded-md shadow-sm",
    tabClassName: "font-bold",
    onChange: fn(),
  },
  render: (args) => (
    <div>
      <Tabs {...args}>
        <TabPanel>
          <div className="p-4 rounded-lg bg-white">
            <h3 className="text-lg font-medium text-gray-900">My Account</h3>
            <p className="mt-2 text-gray-700">Manage your account settings and preferences.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-white">
            <h3 className="text-lg font-medium text-gray-900">Company</h3>
            <p className="mt-2 text-gray-700">View and update your company information.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-white">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <p className="mt-2 text-gray-700">Manage your team members and their access permissions.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-white">
            <h3 className="text-lg font-medium text-gray-900">Billing</h3>
            <p className="mt-2 text-gray-700">Manage your subscription and payment information.</p>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

export const WithDefaultIndex: Story = {
  args: {
    tabs: exampleTabs,
    defaultIndex: 2,
    onChange: fn(),
  },
  render: (args) => (
    <div>
      <Tabs {...args}>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">My Account</h3>
            <p className="mt-2 text-gray-700">Manage your account settings and preferences.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Company</h3>
            <p className="mt-2 text-gray-700">View and update your company information.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
            <p className="mt-2 text-gray-700">Manage your team members and their access permissions.</p>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Billing</h3>
            <p className="mt-2 text-gray-700">Manage your subscription and payment information.</p>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  ),
};

// Exemple avec le mode contrôlé
export const ControlledMode: Story = {
  args: { tabs: exampleTabs },
  render: () => {
    // Utilisation du useState pour gérer l'index sélectionné
    const [selectedTab, setSelectedTab] = useState(0);

    // Gestion du changement d'onglet
    const handleTabChange = (index: number) => {
      setSelectedTab(index);
    };

    // Boutons pour changer d'onglet programmatiquement
    const changeTab = (index: number) => {
      setSelectedTab(index);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2 justify-center">
          <Button onClick={() => changeTab(0)} disabled={selectedTab === 0} size="sm">
            Tab 1
          </Button>
          <Button onClick={() => changeTab(1)} disabled={selectedTab === 1} size="sm">
            Tab 2
          </Button>
          <Button onClick={() => changeTab(2)} disabled={selectedTab === 2} size="sm">
            Tab 3
          </Button>
        </div>

        <Tabs tabs={exampleTabs} selectedIndex={selectedTab} onChange={handleTabChange}>
          <TabPanel>
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">My Account</h3>
              <p className="mt-2 text-gray-700">Manage your account settings and preferences.</p>
              <p className="mt-2 text-gray-700">Selected index: {selectedTab}</p>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Company</h3>
              <p className="mt-2 text-gray-700">View and update your company information.</p>
              <p className="mt-2 text-gray-700">Selected index: {selectedTab}</p>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              <p className="mt-2 text-gray-700">Manage your team members and their access permissions.</p>
              <p className="mt-2 text-gray-700">Selected index: {selectedTab}</p>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="p-4 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Billing</h3>
              <p className="mt-2 text-gray-700">Manage your subscription and payment information.</p>
              <p className="mt-2 text-gray-700">Selected index: {selectedTab}</p>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    );
  },
};
