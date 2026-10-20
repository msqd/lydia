# Navigation System

This directory contains the centralized navigation configuration for the application.

## Overview

The navigation system provides a declarative way to define routes and manage application navigation without hardcoding page logic in the main App component.

## Architecture

### Files

- **`navigation.tsx`** - Centralized route configuration and navigation utilities
- **`src/hooks/useNavigation.ts`** - React hook for navigation state management
- **`src/Components/Navigation/`** - Navigation provider and rendering utilities

### Key Concepts

#### Routes Configuration
Each route is defined with:
```tsx
{
  id: "route-id",           // Unique identifier
  name: "Display Name",     // Shown in navigation
  href: "#route",           // URL fragment
  component: <Component />, // React component to render
  showInNav: true,          // Include in navigation bar
  parentId: "parent-id"     // Optional parent for nested routes
}
```

#### Navigation State
The system maintains:
- `currentRoute`: Active route ID
- `params`: Route parameters (e.g., transaction ID)

## Usage

### Adding a New Page

1. **Create your page component** in `src/Pages/`

2. **Add route to configuration** in `src/config/navigation.tsx`:
```tsx
{
  id: "my-new-page",
  name: "My Page",
  href: "#my-page", 
  component: <MyNewPage />,
  showInNav: true,
}
```

3. **Add navigation action** (optional) in `useNavigation.ts`:
```tsx
goToMyPage: () => navigateTo("my-new-page"),
```

### Route with Parameters

For routes that need parameters (like transaction detail):

```tsx
{
  id: "item-detail",
  name: "Item Detail", 
  href: "#items/detail",
  component: <ItemDetailPage />,
  showInNav: false,
  parentId: "items",
}
```

Then use the navigation action:
```tsx
navigation.navigateTo("item-detail", { itemId: "123" });
```

### Component Props Injection

The system automatically injects appropriate props based on route ID in `NavigationProvider.tsx`:

```tsx
case "transactions":
  return {
    onRowClick: navigation.goToTransactionDetail,
  };

case "transaction-detail":
  return {
    transactionId: navigation.navigationState.params?.transactionId,
    onBack: navigation.goToTransactions,
  };
```

## Benefits

✅ **Centralized Configuration** - All routes defined in one place  
✅ **Type Safety** - Route IDs and navigation actions are typed  
✅ **Easy Maintenance** - Adding new pages requires minimal changes  
✅ **Consistent Navigation** - Navbar automatically updates with route changes  
✅ **Parent-Child Relationships** - Support for nested routes and breadcrumbs  
✅ **Parameter Handling** - Clean handling of route parameters  
✅ **Automatic Prop Injection** - Components receive appropriate props automatically

## Example: Adding a Settings Page

```tsx
// 1. Add to navigation.tsx
{
  id: "settings",
  name: "Settings",
  href: "#settings",
  component: <SettingsPage />,
  showInNav: true,
}

// 2. Add action to useNavigation.ts (optional)
goToSettings: () => navigateTo("settings"),

// 3. Use in component
const navigation = useNavigation();
navigation.goToSettings();
```

The navigation bar will automatically include the new "Settings" link and handle routing appropriately.