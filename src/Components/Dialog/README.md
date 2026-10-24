# Dialog Component

A fully accessible, customizable dialog (modal) component for React applications. Built with Headless UI, fully typed with TypeScript, and styled with TailwindCSS.

## Features

- 🚀 Simple API with multiple customization options
- 🎨 Three size variants (sm, md, lg)
- ♿ Fully accessible with proper ARIA attributes
- ⌨️ Keyboard navigation support (Escape to close, Tab/Shift+Tab for focus)
- 📱 Responsive design for all screen sizes
- ✨ Smooth animations for opening and closing
- 🔤 TypeScript support with full type definitions

## Usage

### Basic Usage

```tsx
import { useState } from "react";
import { Dialog } from "@msqd/lydia/Components/Dialog";
import { Button } from "@msqd/lydia/Components/Buttons";

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Dialog
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Dialog"
        description="This is a basic dialog with title and description."
      >
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Confirm
          </Button>
        </div>
      </Dialog>
    </>
  );
}
```

### Different Sizes

The Dialog component supports three sizes: `sm`, `md` (default) and `lg`.

```tsx
<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Large Dialog"
  size="lg"
>
  {/* Dialog content */}
</Dialog>
```

### Custom Dialog Components

For more customization, you can use the `DialogTitle` and `DialogDescription` components:

```tsx
import { Dialog, DialogTitle, DialogDescription } from "@msqd/lydia/Components/Dialog";

function CustomExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <DialogTitle className="text-xl font-bold text-primary-600">
        Custom Dialog Title
      </DialogTitle>
      
      <DialogDescription className="mt-2 text-gray-600">
        This dialog uses DialogTitle and DialogDescription components for more customization.
      </DialogDescription>
      
      {/* Dialog content */}
    </Dialog>
  );
}
```

## API

### Dialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | required | Controls whether the dialog is displayed |
| `onClose` | () => void | required | Function called when dialog should close |
| `title` | string | - | Optional dialog title |
| `description` | string | - | Optional dialog description |
| `children` | ReactNode | - | Dialog content |
| `size` | "sm" \| "md" \| "lg" | "md" | Controls the width of the dialog |
| `className` | string | - | Additional classes for the outermost dialog container |
| `contentClassName` | string | - | Additional classes for the dialog panel |
| `titleClassName` | string | - | Additional classes for the title |
| `descriptionClassName` | string | - | Additional classes for the description |
| `showCloseButton` | boolean | true | Whether to show the X close button |
| `initialFocus` | RefObject&lt;HTMLElement&gt; \| boolean | true | Ref of the element to focus when the dialog opens; a boolean keeps Headless UI's default focus |
| `backdrop` | boolean | true | Shows the backdrop, which closes the dialog on click and blocks background scroll. When `false`, there is no backdrop, the background stays interactive, and only the close button or your own code closes the dialog |

### DialogTitle Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Title content |
| `className` | string | - | Additional classes for styling |
| `...props` | - | - | Additional props passed to Headless UI DialogTitle |

### DialogDescription Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Description content |
| `className` | string | - | Additional classes for styling |
| `...props` | - | - | Additional props passed to Headless UI DialogDescription |

## Accessibility

The Dialog component is designed with accessibility in mind:

- Uses appropriate ARIA attributes
- Manages focus within the dialog
- Provides keyboard navigation (Escape to close)
- Renders in a portal for proper DOM positioning
- Adds backdrop for visual focus
- Properly manages focus when dialog closes

## Design Considerations

- The dialog is positioned in the center of the screen
- Uses a semi-transparent backdrop to focus attention on the dialog
- Smooth animations for entering and leaving
- Dialog container has proper padding and styling
- Close button is positioned in the top-right corner
- Size variants provide appropriate max-width constraints