import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { Badge } from "@msqd/lydia/Components/Badges";
import { useClickOutside } from "@msqd/lydia/Components/Utilities/useClickOutside";
import {
  type CircuitBreakerStatus as CircuitBreakerStatusType,
  circuitBreakerStatusMap,
} from "@msqd/lydia/Models/System";
import { useState } from "react";

export interface CircuitBreakerStatusProps {
  circuitBreaker: {
    status: CircuitBreakerStatusType;
    failureRate: number;
  };
  compact?: boolean;
  editable?: boolean;
  onChange?: (status: CircuitBreakerStatusType) => void;
}

export function CircuitBreakerStatus({
  circuitBreaker,
  compact = false,
  editable = false,
  onChange,
}: CircuitBreakerStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>({ onClickOutside: () => setIsOpen(false), enabled: isOpen });
  const config = circuitBreakerStatusMap[circuitBreaker.status];

  const handleStatusChange = (newStatus: CircuitBreakerStatusType) => {
    setIsOpen(false);
    onChange?.(newStatus);
  };

  // Compact mode (used on edges)
  if (compact) {
    if (editable) {
      return (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1 bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Badge color={config.color} className="text-xs px-1 py-0">
              {config.icon}
            </Badge>
            <span className="text-xs text-gray-600">{circuitBreaker.failureRate.toFixed(1)}%</span>
            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
          </button>

          {isOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 w-36 bg-white border border-gray-200 rounded overflow-hidden">
              {Object.entries(circuitBreakerStatusMap).map(([status, statusInfo]) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as CircuitBreakerStatusType)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-xs hover:bg-gray-50 transition-colors cursor-pointer ${
                    status === circuitBreaker.status ? "bg-gray-50" : ""
                  } ${Object.keys(circuitBreakerStatusMap).indexOf(status) > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div className="flex items-center space-x-2">
                    <Badge color={statusInfo.color} className="text-xs px-1 py-0">
                      {statusInfo.icon}
                    </Badge>
                    <span className="text-gray-700">{statusInfo.label}</span>
                  </div>
                  {status === circuitBreaker.status && <CheckIcon className="w-3 h-3 text-gray-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Non-editable compact mode
    return (
      <div className="flex items-center space-x-1">
        <Badge color={config.color} className="text-xs px-1 py-0">
          {config.icon}
        </Badge>
        <span className="text-xs text-gray-600">{circuitBreaker.failureRate.toFixed(1)}%</span>
      </div>
    );
  }

  // Full mode
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Circuit Breaker</span>
        {editable ? (
          <div ref={dropdownRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-1 cursor-pointer">
              <Badge color={config.color}>
                {config.icon} {config.label}
              </Badge>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && (
              <div className="absolute top-full mt-1 left-0 z-50 w-36 bg-white border border-gray-200 rounded overflow-hidden">
                {Object.entries(circuitBreakerStatusMap).map(([status, statusInfo]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as CircuitBreakerStatusType)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-xs hover:bg-gray-50 transition-colors cursor-pointer ${
                      status === circuitBreaker.status ? "bg-gray-50" : ""
                    } ${Object.keys(circuitBreakerStatusMap).indexOf(status) > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Badge color={statusInfo.color} className="text-xs px-1 py-0">
                        {statusInfo.icon}
                      </Badge>
                      <span className="text-gray-700">{statusInfo.label}</span>
                    </div>
                    {status === circuitBreaker.status && <CheckIcon className="w-3 h-3 text-gray-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Badge color={config.color}>
            {config.icon} {config.label}
          </Badge>
        )}
      </div>

      <div className="text-xs text-gray-500">
        <div>{config.description}</div>
        <div>Failure rate: {circuitBreaker.failureRate.toFixed(1)}%</div>
      </div>
    </div>
  );
}
