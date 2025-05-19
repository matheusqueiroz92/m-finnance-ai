import { toast } from 'sonner';

export function useNotification() {
  const showSuccess = (message: string, title: string = "Sucesso!") => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const showError = (message: string, title: string = "Erro!") => {
    toast.error(message, {
      duration: 4000,
    });
  };

  const showInfo = (message: string, title?: string) => {
    toast.info(message, {
      duration: 3000,
    });
  };

  const showWarning = (message: string, title: string = "Atenção!") => {
    toast.warning(message, {
      duration: 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}