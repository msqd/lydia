# Security policy

## Supported versions

Lydia is before 1.0: only the latest minor release receives security fixes.

## Reporting a vulnerability

Report privately through GitHub: open the [Security tab](https://github.com/msqd/lydia/security) and choose "Report a vulnerability". This is the only reporting channel. Do not open a public issue or pull request for a vulnerability.

Include the affected version, the component, and a minimal reproduction (the captured data that triggers it, when relevant).

We acknowledge a report within 7 days and triage it within 30 days. A confirmed vulnerability is fixed in a new release and published as a GitHub security advisory.

## Scope

Lydia renders captured HTTP traffic, which is untrusted data. Rendering that lets such data run script, escape its container or corrupt the page is in scope.

The application that embeds Lydia owns the rest: its Content-Security-Policy, authentication and authorization, and redaction of secrets in the data it passes in. See the Security section of the [README](README.md) for what to put in place.
