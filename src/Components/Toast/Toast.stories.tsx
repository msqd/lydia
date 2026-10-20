import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Button } from "../Buttons/Button";
import { Toast } from "./Toast";
import type { ToastType } from "./Toast";
import { ToastContainer } from "./ToastContainer";
import { ToastProvider, useErrorToast, useInfoToast, useSuccessToast, useToast, useWarningToast } from "./ToastContext";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: { default: "light" },
    docs: {
      description: {
        component: `
The Toast Notification System provides a way to display non-blocking messages to users.

This component includes:
- Toast: Individual notification component
- ToastContainer: Container that positions toasts on the screen
- ToastProvider: Context provider that manages toast state
- Helper hooks: useToast, useSuccessToast, useErrorToast, useWarningToast, useInfoToast
        `,
      },
    },
  },
};

export default meta;

export const ToastSystem: StoryObj<typeof ToastProvider> = {
  render: () => {
    const ToastDemo = () => {
      const { addToast, clearAllToasts } = useToast();
      const successToast = useSuccessToast();
      const errorToast = useErrorToast();
      const warningToast = useWarningToast();
      const infoToast = useInfoToast();

      const [count, setCount] = useState(0);

      const handleAddToast = (type: ToastType) => {
        const currentCount = count + 1;
        setCount(currentCount);

        switch (type) {
          case "success":
            successToast(`Success #${currentCount}`, "Operation completed successfully!");
            break;
          case "error":
            errorToast(`Error #${currentCount}`, "An error occurred while processing your request.");
            break;
          case "warning":
            warningToast(`Warning #${currentCount}`, "This action may have consequences.");
            break;
          case "info":
            infoToast(`Info #${currentCount}`, "This is an informational message.");
            break;
        }
      };

      const handleAddCustomToast = () => {
        const currentCount = count + 1;
        setCount(currentCount);

        addToast({
          type: "info",
          title: `Persistent Toast #${currentCount}`,
          message: "This toast will stay until manually closed.",
          duration: undefined, // Disable auto-dismiss
        });
      };

      return (
        <div className="space-y-4 p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Toast Notification System</h2>
            <p className="text-gray-600 mb-4">
              Click the buttons below to trigger different types of toast notifications. Notifications will appear in
              the corner of the screen and automatically dismiss after 5 seconds.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button onClick={() => handleAddToast("success")}>Success Toast</Button>
              <Button variant="secondary" onClick={() => handleAddToast("error")}>
                Error Toast
              </Button>
              <Button onClick={() => handleAddToast("warning")}>Warning Toast</Button>
              <Button variant="secondary" onClick={() => handleAddToast("info")}>
                Info Toast
              </Button>
              <Button onClick={handleAddCustomToast}>Persistent Toast</Button>
              <Button variant="secondary" onClick={clearAllToasts}>
                Clear All
              </Button>
            </div>

            <div className="text-sm bg-gray-100 p-4 rounded">
              <p className="font-semibold">Toasts Added: {count}</p>
              <p className="mt-2">These toasts will appear at the top-right corner of the screen.</p>
            </div>
          </div>
        </div>
      );
    };

    return (
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const ToastPositions: StoryObj<typeof ToastContainer> = {
  render: () => {
    const positions: Array<{
      position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
      label: string;
    }> = [
      { position: "top-right", label: "Top Right" },
      { position: "top-left", label: "Top Left" },
      { position: "bottom-right", label: "Bottom Right" },
      { position: "bottom-left", label: "Bottom Left" },
      { position: "top-center", label: "Top Center" },
      { position: "bottom-center", label: "Bottom Center" },
    ];

    const ToastPositionDemo = () => {
      const [selectedPosition, setSelectedPosition] = useState<
        "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
      >("top-right");
      const successToast = useSuccessToast();

      const showToast = () => {
        successToast("Success!", `This toast appears in the ${selectedPosition} position`);
      };

      return (
        <div className="space-y-4 p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Toast Positions</h2>
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 mt-4">
                {positions.map((pos) => (
                  <div key={pos.position} className="flex items-center">
                    <input
                      type="radio"
                      id={pos.position}
                      name="position"
                      checked={selectedPosition === pos.position}
                      onChange={() => setSelectedPosition(pos.position)}
                      className="mr-2"
                    />
                    <label htmlFor={pos.position}>{pos.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={showToast}>Show Toast at {selectedPosition}</Button>
          </div>

          <ToastContainer position={selectedPosition}>
            {/* Toast components will be rendered here by the ToastProvider */}
          </ToastContainer>
        </div>
      );
    };

    return (
      <ToastProvider>
        <ToastPositionDemo />
      </ToastProvider>
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const ToastVariants: StoryObj<typeof Toast> = {
  render: () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <Toast
        id="success-toast"
        type="success"
        title="Success"
        message="Operation completed successfully"
        show={true}
        onClose={() => {}}
      />
      <Toast
        id="error-toast"
        type="error"
        title="Error"
        message="An error occurred while processing your request"
        show={true}
        onClose={() => {}}
      />
      <Toast
        id="warning-toast"
        type="warning"
        title="Warning"
        message="This action may have consequences"
        show={true}
        onClose={() => {}}
      />
      <Toast
        id="info-toast"
        type="info"
        title="Information"
        message="Your session will expire in 5 minutes"
        show={true}
        onClose={() => {}}
      />
    </div>
  ),
};

export const AutoDismiss: StoryObj<typeof Toast> = {
  render: () => {
    const DismissDemo = () => {
      const [isVisible, setIsVisible] = useState(true);
      const [resetCount, setResetCount] = useState(0);

      const handleClose = () => {
        setIsVisible(false);
      };

      const handleReset = () => {
        setIsVisible(true);
        setResetCount((prev) => prev + 1);
      };

      useEffect(() => {
        setIsVisible(true);
      }, [resetCount]);

      return (
        <div className="space-y-4">
          {isVisible ? (
            <Toast
              id="auto-dismiss-toast"
              type="success"
              title="Auto-dismiss Toast"
              message="This toast will automatically dismiss after 3 seconds"
              duration={3000}
              show={true}
              onClose={handleClose}
            />
          ) : (
            <div className="p-4 bg-gray-100 rounded">
              <p>Toast has been automatically dismissed after 3 seconds.</p>
              <Button onClick={handleReset} className="mt-2">
                Show Again
              </Button>
            </div>
          )}
        </div>
      );
    };

    return <DismissDemo />;
  },
};
