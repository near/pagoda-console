import create from 'zustand';

export type ToastType = 'info' | 'error' | 'success';

export interface Toast {
  action?: () => void;
  actionText?: string;
  description?: string;
  duration?: number;
  icon?: string;
  id: string;
  isOpen: boolean;
  title?: string;
  type?: ToastType;
}

export interface OpenToastOptions {
  action?: () => void;
  actionText?: string;
  description?: string;
  duration?: number;
  icon?: string;
  id?: string;
  title?: string;
  type?: ToastType;
}

interface ToasterStore {
  toasts: Toast[];
  close: (toast: Toast) => void;
  destroy: (toast: Toast) => void;
  open: (options: OpenToastOptions) => void;
}

export const useToasterStore = create<ToasterStore>((set) => ({
  toasts: [],

  close: (toast) => {
    set((state) => {
      const toasts = state.toasts.map((t) => {
        if (t.id === toast.id) {
          return {
            ...t,
            isOpen: false,
          };
        }

        return t;
      });

      setTimeout(() => {
        state.destroy(toast);
      }, 5000);

      return {
        toasts,
      };
    });
  },

  destroy: (toast) => {
    set((state) => {
      const toasts = state.toasts.filter((t) => t.id !== toast.id);

      return {
        toasts,
      };
    });
  },

  open: (options) => {
    const newToast = {
      ...options,
      isOpen: true,
      id: options.id || Date.now().toString(),
      type: options.type || 'info',
    };

    set((state) => {
      if (options.id && state.toasts.find((t) => t.id === options.id && t.isOpen)) return {};

      return {
        toasts: [...state.toasts, newToast],
      };
    });
  },
}));
