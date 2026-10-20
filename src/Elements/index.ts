/**
 * Elements Namespace
 *
 * This namespace contains domain-specific component compositions that combine
 * basic UI components with business logic and data models. Elements provide
 * higher-level abstractions that are specialized for specific use cases
 * while maintaining consistency with the overall design system.
 *
 * Elements are organized by domain:
 * - Transactions: Components for working with transaction data
 * - System: Components for system architecture visualization
 * - Http: Badges for HTTP method / status / cache
 * - Tpdex: The TPDEX performance badge
 */
export * from "./Transactions";
export * from "./System";
export * from "./Http";
export * from "./Tpdex";
