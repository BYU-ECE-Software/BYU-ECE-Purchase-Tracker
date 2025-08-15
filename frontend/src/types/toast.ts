export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastProps = {
  type: ToastType;
  title: string;
  message: string;
  onClose?: () => void;
  duration?: number;
};
