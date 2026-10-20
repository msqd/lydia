import type { NavigationRoute } from "@msqd/lydia/Config/navigation";
import { useNavigation } from "@msqd/lydia/Hooks/useNavigation";
import type { ReactNode } from "react";
import { cloneElement, isValidElement } from "react";

interface NavigationProviderProps {
  children: ReactNode;
}

/**
 * Navigation provider that injects navigation-related props into page components
 */
export function NavigationProvider({ children }: NavigationProviderProps) {
  return <>{children}</>;
}

/**
 * Hook to get component-specific props based on the current route
 */
export function useRouteProps(route: NavigationRoute | undefined, navigation: ReturnType<typeof useNavigation>) {
  if (!route) return {};

  // Return different props based on the route
  switch (route.id) {
    case "transactions":
      return {
        onRowClick: navigation.goToTransactionDetail,
      };

    case "transaction-detail":
      return {
        transactionId: navigation.navigationState.params?.transactionId,
        onBack: navigation.goToTransactions,
      };

    default:
      return {};
  }
}

/**
 * Render a route component with the appropriate props
 */
export function renderRouteComponent(
  route: NavigationRoute | undefined,
  navigation: ReturnType<typeof useNavigation>,
): ReactNode {
  if (!route) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-danger-600">Page Not Found</h1>
      </div>
    );
  }

  const routeProps = useRouteProps(route, navigation);

  // If the component is a React element, clone it with the props
  if (isValidElement(route.component)) {
    return cloneElement(route.component, routeProps);
  }

  // Otherwise return as-is
  return route.component;
}
