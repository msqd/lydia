import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeFormatter } from "./CodeFormatter";

const meta: Meta<typeof CodeFormatter> = {
  title: "Components/Formatter/CodeFormatter",
  component: CodeFormatter,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    code: {
      control: "text",
    },
    language: {
      control: "select",
      options: ["json", "javascript", "typescript", "html", "css", "sql", "text"],
    },
    showLineNumbers: {
      control: "boolean",
    },
    virtualized: {
      control: "boolean",
    },
    maxHeight: {
      control: "number",
    },
    performance: {
      control: "select",
      options: ["none", "summary", "detailed"],
    },
  },
  args: {
    code: '{\n  "name": "John Doe",\n  "age": 30,\n  "email": "john@example.com",\n  "isActive": true,\n  "tags": ["developer", "frontend"]\n}',
    language: "json",
    showLineNumbers: true,
    virtualized: true,
    performance: "none",
  },
};

export default meta;

type Story = StoryObj<typeof CodeFormatter>;

export const Default: Story = {};

export const JavaScript: Story = {
  args: {
    code: `function greet(name) {
  // Say hello
  return "Hello, " + name + "!";
}

// Call the function
const message = greet("World");
console.log(message);`,
    language: "javascript",
  },
};

export const TypeScript: Story = {
  args: {
    code: `interface Person {
  name: string;
  age: number;
  email?: string;
}

function greet(person: Person): string {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

const john: Person = {
  name: "John",
  age: 30
};

console.log(greet(john));`,
    language: "typescript",
  },
};

export const HTML: Story = {
  args: {
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <p>This is a paragraph of text.</p>
    </main>
</body>
</html>`,
    language: "html",
  },
};

export const CSS: Story = {
  args: {
    code: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

header {
  background-color: #333;
  color: white;
  padding: 1rem;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

nav ul {
  display: flex;
  list-style: none;
  padding: 0;
}

nav li {
  margin-right: 1rem;
}

nav a {
  color: white;
  text-decoration: none;
}`,
    language: "css",
  },
};

export const SQL: Story = {
  args: {
    code: `SELECT 
  users.id,
  users.name,
  users.email,
  COUNT(orders.id) AS order_count
FROM 
  users
LEFT JOIN 
  orders ON users.id = orders.user_id
WHERE 
  users.created_at >= '2023-01-01'
  AND users.status = 'active'
GROUP BY 
  users.id,
  users.name,
  users.email
HAVING 
  COUNT(orders.id) > 0
ORDER BY 
  order_count DESC
LIMIT 10;`,
    language: "sql",
  },
};

export const PlainText: Story = {
  args: {
    code: `This is plain text.
No syntax highlighting here.
Just regular text content.

Line 1
Line 2
Line 3`,
    language: "text",
  },
};

export const WithMaxHeight: Story = {
  args: {
    code: Array(50).fill('{"line": "This is a sample line of JSON"}').join("\n"),
    maxHeight: 200,
  },
};

export const InvalidJSON: Story = {
  args: {
    code: `{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  This is invalid JSON
}`,
    language: "json",
  },
};

export const WithoutLineNumbers: Story = {
  args: {
    showLineNumbers: false,
  },
};

// Helper function to generate large JSON data efficiently
const generateLargeJSON = (targetSizeMB: number): string => {
  const targetBytes = targetSizeMB * 1024 * 1024;

  // Pre-calculate a sample user JSON to estimate size per user
  const sampleUser = {
    id: "user_00000001",
    name: "User Name 1",
    email: "user1@example.com",
    age: 25,
    isActive: true,
    address: {
      street: "1 Sample Street Apt 1",
      city: "City 1",
      state: "State 1",
      zipCode: "10001",
      country: "United States",
    },
    tags: ["tag_1", "category_1", "type_1", "role_1"],
    metadata: {
      lastLogin: "2024-01-01T01:01:01.000Z",
      loginCount: 1,
      preferences: {
        theme: "dark",
        language: "en",
        timezone: "UTC+01:00",
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },
      analytics: {
        pageViews: 10,
        sessionDuration: 5,
        bounceRate: 0.01,
      },
    },
    createdAt: "2023-01-01T01:01:01.000Z",
    updatedAt: "2024-01-01T01:01:01.000Z",
  };

  // Calculate bytes per user (including JSON formatting)
  const sampleUserJson = JSON.stringify(sampleUser, null, 2);
  const bytesPerUser = new TextEncoder().encode(sampleUserJson + ",\n").length;

  // Calculate how many users we need
  const metaOverheadBytes = 200; // Approximate overhead for meta object and structure
  const availableBytes = targetBytes - metaOverheadBytes;
  const estimatedUserCount = Math.floor(availableBytes / bytesPerUser);

  // Generate users efficiently without size checks
  const users: any[] = [];
  for (let counter = 1; counter <= estimatedUserCount; counter++) {
    const user = {
      id: `user_${counter.toString().padStart(8, "0")}`,
      name: `User Name ${counter}`,
      email: `user${counter}@example.com`,
      age: 20 + (counter % 60),
      isActive: counter % 3 !== 0,
      address: {
        street: `${counter} Sample Street Apt ${counter % 100}`,
        city: `City ${counter % 1000}`,
        state: `State ${counter % 50}`,
        zipCode: (10000 + (counter % 90000)).toString(),
        country: "United States",
      },
      tags: [`tag_${counter % 100}`, `category_${counter % 50}`, `type_${counter % 25}`, `role_${counter % 10}`],
      metadata: {
        lastLogin: `2024-${String((counter % 12) + 1).padStart(2, "0")}-${String((counter % 28) + 1).padStart(2, "0")}T${String(counter % 24).padStart(2, "0")}:${String(counter % 60).padStart(2, "0")}:${String(counter % 60).padStart(2, "0")}.000Z`,
        loginCount: counter % 1000,
        preferences: {
          theme: counter % 2 === 0 ? "dark" : "light",
          language: ["en", "es", "fr", "de", "zh"][counter % 5],
          timezone: `UTC${counter % 2 === 0 ? "+" : "-"}${String((counter % 12) + 1).padStart(2, "0")}:00`,
          notifications: {
            email: counter % 3 === 0,
            sms: counter % 5 === 0,
            push: counter % 2 === 0,
          },
        },
        analytics: {
          pageViews: counter * 10,
          sessionDuration: counter * 5,
          bounceRate: (counter % 100) / 100,
        },
      },
      createdAt: `2023-${String((counter % 12) + 1).padStart(2, "0")}-${String((counter % 28) + 1).padStart(2, "0")}T${String(counter % 24).padStart(2, "0")}:${String(counter % 60).padStart(2, "0")}:${String(counter % 60).padStart(2, "0")}.000Z`,
      updatedAt: `2024-${String((counter % 12) + 1).padStart(2, "0")}-${String((counter % 28) + 1).padStart(2, "0")}T${String(counter % 24).padStart(2, "0")}:${String(counter % 60).padStart(2, "0")}:${String(counter % 60).padStart(2, "0")}.000Z`,
    };
    users.push(user);
  }

  const result = {
    meta: {
      total: users.length,
      generatedAt: new Date().toISOString(),
      targetSizeMB,
      estimatedSizeMB: Math.round(((users.length * bytesPerUser + metaOverheadBytes) / (1024 * 1024)) * 100) / 100,
    },
    users,
  };

  return JSON.stringify(result, null, 2);
};

export const LargeFile10MB: Story = {
  args: {
    code: generateLargeJSON(10),
    language: "json",
    maxHeight: 400,
    performance: "summary",
    virtualized: true,
  },
  parameters: {
    controls: {
      exclude: ["code"],
    },
  },
};
