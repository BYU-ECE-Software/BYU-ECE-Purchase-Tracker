import React, { useEffect } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { ToastProps } from '../types/toast';

// Define style settings for each toast type (success, error, info, warning)
const typeStyles: Record<
  'success' | 'error' | 'info' | 'warning',
  {
    borderColor: string;
    iconColor: string;
    Icon: IconType;
  }
> = {
  success: {
    borderColor: 'border-byuGreenBright',
    iconColor: 'text-byuGreenBright',
    Icon: FaCheckCircle,
  },
  error: {
    borderColor: 'border-byuRedBright',
    iconColor: 'text-byuRedBright',
    Icon: FaTimesCircle,
  },
  info: {
    borderColor: 'border-byuInfoBlueBright',
    iconColor: 'text-byuInfoBlueBright',
    Icon: FaInfoCircle,
  },
  warning: {
    borderColor: 'border-byuYellowBright',
    iconColor: 'text-byuYellowBright',
    Icon: FaExclamationTriangle,
  },
};

// Define the Toast component
const Toast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 4000,
}) => {
  // Get the styles and icon for this toast type
  const { borderColor, iconColor, Icon } = typeStyles[type];

  // Automatically close the toast after a set time
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer); // Cleanup if component unmounts early
  }, [onClose, duration]);

  return (
    <div
      className={`flex items-start p-4 bg-white rounded shadow-md border-l-4 ${borderColor}`}
    >
      {/* Icon on the left */}
      <div className="mr-3 mt-1">
        {React.createElement(Icon as React.FC<{ className?: string }>, {
          className: `text-xl ${iconColor}`,
        })}
      </div>

      {/* Title and message */}
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600">{message}</p>
      </div>

      {/* Close button (optional) */}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700 text-lg font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
