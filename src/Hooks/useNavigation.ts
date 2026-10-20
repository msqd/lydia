import type { NavigationState } from "@msqd/lydia/Config/navigation";
import { getCurrentRoute, getDefaultRoute, getNavigationItems, getRouteByHref } from "@msqd/lydia/Config/navigation";
import { useCallback, useState } from "react";

/**
 * Navigation hook for managing application routing and state
 */
export function useNavigation() {
  // Initialize with default route
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentRoute: getDefaultRoute().id,
    params: {},
  });

  /**
   * Navigate to a specific route
   */
  const navigateTo = useCallback((routeId: string, params?: Record<string, string>) => {
    setNavigationState({
      currentRoute: routeId,
      params: params || {},
    });
  }, []);

  /**
   * Navigate by href (useful for direct URL access)
   */
  const navigateToHref = useCallback(
    (href: string, params?: Record<string, string>) => {
      const route = getRouteByHref(href);
      if (route) {
        navigateTo(route.id, params);
      }
    },
    [navigateTo],
  );

  /**
   * Get navigation items with proper current state
   */
  const getNavItems = useCallback(() => {
    return getNavigationItems(navigationState).map((item) => ({
      ...item,
      onClick: () => {
        const route = getRouteByHref(item.href);
        if (route) {
          navigateTo(route.id);
        }
      },
    }));
  }, [navigationState, navigateTo]);

  /**
   * Get the current route configuration
   */
  const currentRoute = getCurrentRoute(navigationState.currentRoute);

  /**
   * Navigation actions for common operations
   */
  const navigationActions = {
    goToOverview: () => navigateTo("overview"),
    goToTransactions: () => navigateTo("transactions"),
    goToTransactionDetail: (transactionId: string) => navigateTo("transaction-detail", { transactionId }),
    goToExplorer: () => navigateTo("explorer"),
    goToAlerts: () => navigateTo("alerts"),
    goToSystem: () => navigateTo("system"),
    goBack: () => {
      // Navigate to parent route if available, otherwise go to overview
      if (currentRoute?.parentId) {
        navigateTo(currentRoute.parentId);
      } else {
        navigateTo("overview");
      }
    },
  };

  return {
    // State
    navigationState,
    currentRoute,

    // Navigation functions
    navigateTo,
    navigateToHref,
    getNavItems,

    // Convenience actions
    ...navigationActions,
  };
}
