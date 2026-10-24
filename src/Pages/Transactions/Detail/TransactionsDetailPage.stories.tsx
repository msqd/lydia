import { ToastProvider } from "@msqd/lydia/Components/Toast";
import type { ContentType, DetailedTransaction } from "@msqd/lydia/Models/Transactions/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TransactionsDetailPage } from "./TransactionsDetailPage";
import { sampleDetailedTransaction } from "./TransactionsDetailPage.samples";

// Toast wrapper for proper functionality
const ToastWrapper = (Story: React.ComponentType) => (
  <ToastProvider>
    <Story />
  </ToastProvider>
);

const meta = {
  title: "Pages/Transactions/Detail",
  component: TransactionsDetailPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "TransactionsDetailPage provides a detailed view of HTTP transaction data using a pane-based layout similar to the filter sidebar. Features include transaction metadata with HTTP-specific fields, request/response details with content type-aware formatting, performance metrics, and copy-to-clipboard functionality. Can be used both as a full page or as a drawer component.",
      },
    },
  },
  decorators: [ToastWrapper],
  args: {
    transaction: sampleDetailedTransaction,
  },
  argTypes: {
    isDrawer: {
      description: "Whether to render as a drawer component or full page",
      control: "boolean",
    },
  },
} satisfies Meta<typeof TransactionsDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultView: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Default full-page view of an HTTP transaction detail showing metadata, request and response information with headers and body content formatted according to content type.",
      },
    },
  },
};

export const DrawerView: Story = {
  args: {
    isDrawer: true,
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Transaction detail displayed as a drawer component, suitable for use in a sidebar or overlay. Removes the page title and layout wrapper.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-96 w-80 border border-gray-200 rounded-md overflow-hidden">
        <Story />
      </div>
    ),
    ...meta.decorators,
  ],
};

export const WithCustomStyling: Story = {
  args: {
    className: "bg-gray-50 p-6",
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction detail page with custom background color and padding.",
      },
    },
  },
};

// Helper function to create a transaction with specific content type
const createTransactionWithContent = (
  id: string,
  contentType: ContentType,
  requestBody: any,
  responseBody: any,
  additionalProps?: Partial<DetailedTransaction>,
): DetailedTransaction => ({
  id,
  url: `/api/content/${contentType}`,
  method: "GET",
  status: "Successful",
  statusCode: 200,
  timestamp: new Date().toISOString(),
  responseTime: Math.floor(Math.random() * 200) + 50,
  client: "Test Client",
  apiName: "content-api",
  userAgent: "TestClient/1.0",
  remoteAddress: "127.0.0.1",
  request: {
    headers: [
      { name: "Accept", value: "*/*" },
      { name: "User-Agent", value: "TestClient/1.0" },
    ],
    body: requestBody,
    contentType: requestBody ? "json" : undefined,
    size: requestBody ? JSON.stringify(requestBody).length : 0,
  },
  response: {
    headers: [
      { name: "Server", value: "nginx/1.25.0" },
      { name: "Cache-Control", value: "no-cache" },
    ],
    body: responseBody,
    contentType,
    size: typeof responseBody === "string" ? responseBody.length : 1024,
  },
  ...additionalProps,
});

// JSON Response Example
export const JsonResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-json",
      "json",
      { query: "users", limit: 10 },
      {
        users: [
          { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
          { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
          { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "user" },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      },
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Transaction with JSON request and response bodies. Shows syntax highlighting and formatting for JSON content.",
      },
    },
  },
};

// XML Response Example
export const XmlResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-xml",
      "xml",
      null,
      `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
</catalog>`,
      { method: "GET", url: "/api/catalog/books.xml" },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with XML response body. Shows syntax highlighting for XML content.",
      },
    },
  },
};

// Plain Text Response Example
export const PlainTextResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-text",
      "text",
      null,
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Status Report:
- System: Operational
- Database: Connected
- Cache: Active
- Queue: 42 items pending

Last updated: ${new Date().toLocaleString()}`,
      { url: "/api/status/report.txt" },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with plain text response body. Shows simple text formatting without syntax highlighting.",
      },
    },
  },
};

// HTML Response Example
export const HtmlResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-html",
      "html",
      null,
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; }
        code { background: #e0e0e0; padding: 2px 4px; }
    </style>
</head>
<body>
    <h1>API Documentation</h1>
    <p>Welcome to our API documentation. Below you'll find available endpoints:</p>
    
    <div class="endpoint">
        <h2>GET /api/users</h2>
        <p>Retrieve a list of users</p>
        <p>Parameters: <code>limit</code>, <code>offset</code></p>
    </div>
    
    <div class="endpoint">
        <h2>POST /api/users</h2>
        <p>Create a new user</p>
        <p>Body: <code>{ name, email, password }</code></p>
    </div>
</body>
</html>`,
      { url: "/api/docs/index.html" },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with HTML response body. Shows syntax highlighting for HTML markup.",
      },
    },
  },
};

// Image Response Example (PNG)
export const ImagePngResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-image-png",
      "image",
      null,
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      {
        url: "/api/images/pixel.png",
        response: {
          headers: [
            { name: "Content-Type", value: "image/png" },
            { name: "Content-Length", value: "67" },
            { name: "Cache-Control", value: "public, max-age=3600" },
          ],
          body: "[Binary PNG data]",
          contentType: "image",
          size: 67,
        },
      },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with PNG image response. Shows binary content indicator for image data.",
      },
    },
  },
};

// Image Response Example (JPEG)
export const ImageJpegResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-image-jpeg",
      "image",
      null,
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      {
        url: "/api/images/photo.jpg",
        response: {
          headers: [
            { name: "Content-Type", value: "image/jpeg" },
            { name: "Content-Length", value: "285" },
            { name: "Cache-Control", value: "public, max-age=3600" },
          ],
          body: "[Binary JPEG data]",
          contentType: "image",
          size: 285,
        },
      },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with JPEG image response. Shows binary content indicator for image data.",
      },
    },
  },
};

// PDF Response Example
export const PdfResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-pdf",
      "binary",
      null,
      "data:application/pdf;base64,JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgNCAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzYW1wbGUgUERGIGRvY3VtZW50IHRoYXQgY2FuIGJlIHByZXZpZXdlZCBpbiB0aGUgVHJhbnNhY3Rpb24gRGV0YWlsIFBhZ2UuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo2IDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCi9QYXJlbnQgMyAwIFINCi9SZXNvdXJjZXMgPDwNCi9Gb250IDw8DQovRjEgOSAwIFIgDQo+Pg0KL1Byb2NTZXQgOCAwIFINCj4+DQovTWVkaWFCb3ggWzAgMCA2MTIuMDAwMCA3OTIuMDAwMF0NCi9Db250ZW50cyA3IDAgUg0KPj4NCmVuZG9iag0KDQo3IDAgb2JqDQo8PCAvTGVuZ3RoIDY3NiA+Pg0Kc3RyZWFtDQoyIEoNCkJUDQowIDAgMCByZw0KL0YxIDAwMjcgVGYNCjU3LjM3NTAgNzIyLjI4MDAgVGQNCiggQSBTaW1wbGUgUERGIEZpbGUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2ODguNjA4MCBUZA0KKCBUaGlzIGlzIGEgc2ltcGxlIHNtYWxsIFBERiBmaWxlIC0gKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQo4IDAgb2JqDQpbL1BERiAvVGV4dCBdDQplbmRvYmoNCjkgMCBvYmoNCjw8DQovVHlwZSAvRm9udA0KL1N1YnR5cGUgL1R5cGUxDQovTmFtZSAvRjENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZw0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDEwDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMDkgMDAwMDAgbg0KMDAwMDAwMDA3NCAwMDAwMCBuDQowMDAwMDAwMTIwIDAwMDAwIG4NCjAwMDAwMDAxNzkgMDAwMDAgbg0KMDAwMDAwMDM2NCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCnRyYWlsZXINCjw8DQovU2l6ZSAxMA0KL1Jvb3QgMSAwIFINCi9JbmZvIDEwIDAgUg0KPj4NCnN0YXJ0eHJlZg0KMjYwMA0KJSVFT0YNCg==",
      {
        url: "/api/reports/monthly-report.pdf",
        response: {
          headers: [
            { name: "Content-Type", value: "application/pdf" },
            { name: "Content-Disposition", value: "attachment; filename=monthly-report.pdf" },
            { name: "Content-Length", value: "2600" },
          ],
          body: "data:application/pdf;base64,JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgNCAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzYW1wbGUgUERGIGRvY3VtZW50IHRoYXQgY2FuIGJlIHByZXZpZXdlZCBpbiB0aGUgVHJhbnNhY3Rpb24gRGV0YWlsIFBhZ2UuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo2IDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2UNCi9QYXJlbnQgMyAwIFINCi9SZXNvdXJjZXMgPDwNCi9Gb250IDw8DQovRjEgOSAwIFIgDQo+Pg0KL1Byb2NTZXQgOCAwIFINCj4+DQovTWVkaWFCb3ggWzAgMCA2MTIuMDAwMCA3OTIuMDAwMF0NCi9Db250ZW50cyA3IDAgUg0KPj4NCmVuZG9iag0KDQo3IDAgb2JqDQo8PCAvTGVuZ3RoIDY3NiA+Pg0Kc3RyZWFtDQoyIEoNCkJUDQowIDAgMCByZw0KL0YxIDAwMjcgVGYNCjU3LjM3NTAgNzIyLjI4MDAgVGQNCiggQSBTaW1wbGUgUERGIEZpbGUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2ODguNjA4MCBUZA0KKCBUaGlzIGlzIGEgc2ltcGxlIHNtYWxsIFBERiBmaWxlIC0gKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQo4IDAgb2JqDQpbL1BERiAvVGV4dCBdDQplbmRvYmoNCjkgMCBvYmoNCjw8DQovVHlwZSAvRm9udA0KL1N1YnR5cGUgL1R5cGUxDQovTmFtZSAvRjENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZw0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDEwDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMDkgMDAwMDAgbg0KMDAwMDAwMDA3NCAwMDAwMCBuDQowMDAwMDAwMTIwIDAwMDAwIG4NCjAwMDAwMDAxNzkgMDAwMDAgbg0KMDAwMDAwMDM2NCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCnRyYWlsZXINCjw8DQovU2l6ZSAxMA0KL1Jvb3QgMSAwIFINCi9JbmZvIDEwIDAgUg0KPj4NCnN0YXJ0eHJlZg0KMjYwMA0KJSVFT0YNCg==",
          contentType: "binary",
          size: 2600,
        },
      },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with PDF response. Shows PDF preview in an iframe with download button.",
      },
    },
  },
};

// Binary Response Example
export const BinaryResponse: Story = {
  args: {
    transaction: createTransactionWithContent("tx-binary", "binary", null, "[Binary data]", {
      url: "/api/files/data.bin",
      method: "GET",
      response: {
        headers: [
          { name: "Content-Type", value: "application/octet-stream" },
          { name: "Content-Length", value: "1048576" },
          { name: "Content-Disposition", value: "attachment; filename=data.bin" },
        ],
        body: "[Binary data - 1 MB]",
        contentType: "binary",
        size: 1048576,
      },
    }),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with generic binary response. Shows binary content indicator with file size.",
      },
    },
  },
};

// Binary Response With An Extended Filename Example
export const BinaryResponseExtendedFilename: Story = {
  args: {
    transaction: createTransactionWithContent("tx-binary-extended", "binary", null, "data:text/plain,a,b", {
      url: "/api/files/rates",
      method: "GET",
      response: {
        headers: [
          { name: "Content-Type", value: "text/plain" },
          { name: "Content-Disposition", value: "attachment; filename*=UTF-8''%E2%82%AC%20rates.html" },
        ],
        body: "data:text/plain,a,b",
        contentType: "binary",
      },
    }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Binary response whose filename comes from `filename*` (shown as `€ rates.html`) and whose body is a non-base64 data URL: Download saves `a,b`.",
      },
    },
  },
};

// Large JSON Response Example
export const LargeJsonResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-large-json",
      "json",
      null,
      {
        metadata: {
          generated: new Date().toISOString(),
          records: 1000,
        },
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          uuid: `uuid-${i + 1}`,
          name: `Record ${i + 1}`,
          description: `This is a detailed description for record ${i + 1}`,
          status: i % 3 === 0 ? "active" : i % 3 === 1 ? "pending" : "inactive",
          created: new Date(Date.now() - i * 86400000).toISOString(),
          updated: new Date(Date.now() - i * 43200000).toISOString(),
          tags: [`tag${i % 10}`, `category${i % 5}`, `type${i % 3}`],
          metrics: {
            views: Math.floor(Math.random() * 10000),
            clicks: Math.floor(Math.random() * 1000),
            conversions: Math.floor(Math.random() * 100),
          },
        })),
      },
      {
        url: "/api/data/export?limit=1000",
        responseTime: 523,
        response: {
          headers: [
            { name: "Content-Type", value: "application/json" },
            { name: "X-Total-Records", value: "1000" },
            { name: "X-Response-Time", value: "523ms" },
          ],
          body: "[Large JSON data]",
          contentType: "json",
          size: 125000,
        },
      },
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Transaction with large JSON response (1000 records). Demonstrates virtualization and performance features of the code formatter.",
      },
    },
  },
};

// Error Response Examples
export const ErrorJsonResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-error-json",
      "json",
      { username: "admin", password: "wrong" },
      {
        error: {
          code: "AUTH_FAILED",
          message: "Invalid username or password",
          details: {
            attempts: 3,
            maxAttempts: 5,
            lockoutTime: null,
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: "Failed",
        statusCode: 401,
        url: "/api/auth/login",
        method: "POST",
      },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Failed transaction with JSON error response. Shows how error responses are formatted.",
      },
    },
  },
};

// Mixed Content Example (Form Data)
export const FormDataResponse: Story = {
  args: {
    transaction: createTransactionWithContent(
      "tx-form",
      "json",
      {
        _formData: "name=John+Doe&email=john%40example.com&message=Hello+World",
      },
      {
        success: true,
        id: "msg-123",
        message: "Form submitted successfully",
      },
      {
        url: "/api/contact/submit",
        method: "POST",
        request: {
          headers: [
            { name: "Content-Type", value: "application/x-www-form-urlencoded" },
            { name: "Content-Length", value: "63" },
          ],
          body: "name=John+Doe&email=john%40example.com&message=Hello+World",
          contentType: "text",
          size: 63,
        },
      },
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Transaction with form data request and JSON response. Shows handling of URL-encoded form data.",
      },
    },
  },
};
