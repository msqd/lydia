# Toast Component

A lightweight, customizable toast notification system for React applications.

## Features

- 🎨 Four notification types: success, error, warning, info
- ⏱️ Auto-dismiss with customizable duration
- 📱 Responsive design with proper text wrapping
- 🧠 Context-based state management
- 📍 Customizable position (top/bottom, left/right/center)
- 🎬 Smooth enter/exit animations
- ♿ Accessible design with proper ARIA attributes
- 🔢 Stack management (limit number of visible toasts)

## Installation

No additional dependencies required beyond the core Lydia components.

## Basic Usage

Wrap your application with the `ToastProvider` component:

```tsx
// In your app root component
import { ToastProvider } from "@msqd/lydia/Components/Toast";

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
```

Use the `useToast` hook to show notifications:

```tsx
import { useToast } from "@msqd/lydia/Components/Toast";

function MyComponent() {
  const { addToast } = useToast();
  
  const handleClick = () => {
    addToast({
      type: "success",
      title: "Operation successful",
      message: "Your changes have been saved.",
    });
  };
  
  return <button onClick={handleClick}>Save</button>;
}
```

## Type-Specific Hooks

For convenience, there are specific hooks for each toast type:

```tsx
import { 
  useSuccessToast, 
  useErrorToast, 
  useWarningToast, 
  useInfoToast 
} from "@msqd/lydia/Components/Toast";

function MyComponent() {
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  const showWarning = useWarningToast();
  const showInfo = useInfoToast();
  
  return (
    <div>
      <button onClick={() => showSuccess("Success!", "Operation completed")}>
        Show Success
      </button>
      
      <button onClick={() => showError("Error", "Something went wrong")}>
        Show Error
      </button>
      
      <button onClick={() => showWarning("Warning", "This action cannot be undone")}>
        Show Warning
      </button>
      
      <button onClick={() => showInfo("Info", "Your session expires in 5 minutes")}>
        Show Info
      </button>
    </div>
  );
}
```

## Toast Provider Options

You can customize the toast provider with the following props:

```tsx
<ToastProvider
  // The default duration for toasts in milliseconds (default: 5000)
  defaultDuration={3000}
  
  // Maximum number of toasts to show at once (default: 5)
  maxToasts={3}
  
  // Position of the toast container (default: "top-right")
  position="bottom-left"
>
  <YourApp />
</ToastProvider>
```

## Toast Options

Each toast notification can be customized with the following options:

```tsx
addToast({
  // Required fields
  type: "success", // "success" | "error" | "warning" | "info"
  title: "Success!", // Main toast message
  
  // Optional fields
  message: "Your changes have been saved.", // Additional details
  duration: 3000, // Override default duration (set to null for no auto-dismiss)
  onClose: () => console.log("Toast closed"), // Callback when toast is closed
});
```

## Advanced Usage

### Managing Toasts Programmatically

```tsx
const { addToast, removeToast, clearAllToasts } = useToast();

// Add a toast and store its ID
const toastId = addToast({
  type: "info",
  title: "Processing...",
  duration: null, // Don't auto-dismiss
});

// Later, remove the specific toast
removeToast(toastId);

// Or clear all toasts at once
clearAllToasts();
```

### Custom Positioning

```tsx
<ToastProvider position="bottom-center">
  <YourApp />
</ToastProvider>
```

Available positions:
- `top-right` (default)
- `top-left`
- `top-center`
- `bottom-right`
- `bottom-left`
- `bottom-center`