import type { DetailedTransaction, Transaction } from "./types";

/**
 * Sample transaction data for stories, tests and the demo app. Kept out of the public type module
 * so no sample data ships in the library's API. Excluded from the build and the published exports.
 *
 * Every sample here has ended, so every one carries a measured `tpdex`. A finished transaction
 * without one would misrepresent the model: an absent score means "still running", and TpdexBadge
 * renders it as an estimate rather than a measurement. For a mix of both, see the badge's own
 * stories.
 */
export const sampleTransactions: Transaction[] = [
  {
    id: "tx001",
    url: "/api/users/123/profile",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T10:30:00",
    responseTime: 15,
    tpdex: 98,
    client: "Mobile App",
    apiName: "users-api",
    userAgent: "MyApp/2.5.0 (iOS)",
    remoteAddress: "192.168.1.100",
    cacheStatus: "hit",
  },
  {
    id: "tx002",
    url: "/api/orders",
    method: "POST",
    status: "Successful",
    statusCode: 201,
    timestamp: "2025-05-20T10:15:00",
    responseTime: 65,
    tpdex: 95,
    client: "Website",
    apiName: "payments-api",
    userAgent: "Mozilla/5.0 (Chrome/120.0)",
    remoteAddress: "10.0.1.50",
  },
  {
    id: "tx003",
    url: "/api/users/999",
    method: "GET",
    status: "Failed",
    statusCode: 404,
    timestamp: "2025-05-20T10:05:00",
    responseTime: 42,
    tpdex: 97,
    client: "External API",
    apiName: "users-api",
    userAgent: "APIClient/1.0",
    remoteAddress: "203.0.113.42",
  },
  {
    id: "tx004",
    url: "/api/analytics/report?period=daily",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T09:55:00",
    responseTime: 22,
    tpdex: 98,
    client: "Admin Dashboard",
    apiName: "analytics-api",
    userAgent: "AdminPanel/3.1.0",
    remoteAddress: "172.16.0.25",
    cacheStatus: "hit",
  },
  {
    id: "tx005",
    url: "/api/products/456",
    method: "PUT",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T09:45:00",
    responseTime: 76,
    tpdex: 94,
    client: "Website",
    apiName: "catalog-api",
    userAgent: "Mozilla/5.0 (Firefox/121.0)",
    remoteAddress: "10.0.1.75",
  },
  {
    id: "tx006",
    url: "/api/batch/import",
    method: "POST",
    status: "Successful",
    statusCode: 202,
    timestamp: "2025-05-20T09:30:00",
    responseTime: 156,
    tpdex: 89,
    client: "Backend Service",
    apiName: "erp-api",
    userAgent: "BatchProcessor/1.2.0",
    remoteAddress: "172.16.10.5",
  },
  {
    id: "tx007",
    url: "/api/webhooks/stripe",
    method: "POST",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T09:15:00",
    responseTime: 315,
    tpdex: 79,
    client: "Webhook",
    apiName: "stripe",
    userAgent: "Stripe/1.0",
    remoteAddress: "54.187.174.169",
    cacheStatus: "stale",
  },
  {
    id: "tx008",
    url: "/api/admin/users/123",
    method: "DELETE",
    status: "Failed",
    statusCode: 403,
    timestamp: "2025-05-20T09:00:00",
    responseTime: 34,
    tpdex: 97,
    client: "Website",
    apiName: "admin-api",
    userAgent: "Mozilla/5.0 (Safari/17.0)",
    remoteAddress: "10.0.1.80",
  },
  {
    id: "tx009",
    url: "/api/auth/verify",
    method: "POST",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T08:45:00",
    responseTime: 67,
    tpdex: 95,
    client: "Mobile App",
    apiName: "auth-api",
    userAgent: "MyApp/2.5.0 (Android)",
    remoteAddress: "192.168.1.101",
  },
  {
    id: "tx010",
    url: "/api/search?q=user&limit=50",
    method: "GET",
    status: "Successful",
    statusCode: 200,
    timestamp: "2025-05-20T08:30:00",
    responseTime: 189,
    tpdex: 87,
    client: "Admin Dashboard",
    apiName: "search-api",
    userAgent: "AdminPanel/3.1.0",
    remoteAddress: "172.16.0.30",
    cacheStatus: "bypass",
  },
];

/**
 * Sample detailed HTTP transaction data.
 */
export const sampleDetailedTransaction: DetailedTransaction = {
  id: "tx123456",
  url: "/api/users/profile",
  method: "POST",
  status: "Successful",
  statusCode: 201,
  timestamp: "2025-05-20T10:30:00",
  responseTime: 87,
  tpdex: 93,
  client: "Mobile App",
  apiName: "users-api",
  userAgent: "MyApp/2.5.0 (iOS 17.0)",
  remoteAddress: "192.168.1.100",
  tags: { domain: "user", surface: "profile", client: "mobile" },
  cacheStatus: "miss",
  request: {
    headers: [
      { name: "Content-Type", value: "application/json" },
      { name: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
      { name: "User-Agent", value: "MyApp/2.5.0 (iOS 17.0)" },
      { name: "X-Request-ID", value: "req-abc-123" },
      { name: "Accept", value: "application/json" },
      { name: "X-Forwarded-For", value: "192.168.1.100" },
    ],
    body: {
      name: "John Doe",
      email: "john.doe@example.com",
      preferences: {
        theme: "dark",
        notifications: true,
        language: "en",
      },
      metadata: {
        source: "mobile-app",
        version: "2.5.0",
      },
    },
    contentType: "json",
    size: 245,
  },
  response: {
    headers: [
      { name: "Content-Type", value: "application/json" },
      { name: "Server", value: "nginx/1.20.1" },
      { name: "X-Response-Time", value: "87ms" },
      { name: "Cache-Control", value: "no-cache" },
      { name: "Date", value: "Tue, 20 May 2025 10:30:00 GMT" },
      { name: "X-Request-ID", value: "req-abc-123" },
      // A repeated name and a case-varying pair, so the library's own data exercises what a
      // map-shaped model could not represent.
      { name: "Set-Cookie", value: "session=b7f3a1c9; Path=/; HttpOnly; Secure; SameSite=Lax" },
      { name: "set-cookie", value: "csrf=9d2e4f81; Path=/; Secure; SameSite=Strict" },
      { name: "set-cookie", value: "locale=en-GB; Path=/; Max-Age=31536000" },
    ],
    body: {
      id: "user-123456",
      name: "John Doe",
      email: "john.doe@example.com",
      created: "2025-05-20T10:30:00Z",
      updated: "2025-05-20T10:30:00Z",
      preferences: {
        theme: "dark",
        notifications: true,
        language: "en",
      },
    },
    contentType: "json",
    size: 312,
  },
};

/**
 * Sample transaction with XML content, for content-type testing.
 */
export const sampleXmlTransaction: DetailedTransaction = {
  id: "tx789",
  url: "/api/soap/userService",
  method: "POST",
  status: "Successful",
  statusCode: 200,
  timestamp: "2025-05-20T10:35:00",
  responseTime: 124,
  tpdex: 91,
  client: "SOAP Client",
  userAgent: "SOAPClient/1.0",
  remoteAddress: "10.0.2.15",
  tags: { protocol: "soap", format: "xml" },
  request: {
    headers: [
      { name: "Content-Type", value: "text/xml; charset=utf-8" },
      { name: "SOAPAction", value: "urn:getUserProfile" },
      { name: "Authorization", value: "Basic dXNlcjpwYXNz" },
    ],
    body: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getUserProfile>
      <userId>123</userId>
    </getUserProfile>
  </soap:Body>
</soap:Envelope>`,
    contentType: "xml",
    size: 278,
  },
  response: {
    headers: [
      { name: "Content-Type", value: "text/xml; charset=utf-8" },
      { name: "Server", value: "Apache/2.4.41" },
    ],
    body: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getUserProfileResponse>
      <user>
        <id>123</id>
        <name>John Doe</name>
        <email>john@example.com</email>
      </user>
    </getUserProfileResponse>
  </soap:Body>
</soap:Envelope>`,
    contentType: "xml",
    size: 415,
  },
};
