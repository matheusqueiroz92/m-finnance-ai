import { toast } from 'sonner';
import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  error?: {
    message: string;
    details?: any;
  };
  success: boolean;
}

export const handleError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError;
    
    // Se temos uma mensagem de erro da API
    if (data?.error?.message) {
      toast.error(data.error.message, {
        duration: 4000,
      });
      return;
    }
    
    // Mensagens de erro específicas por status HTTP
    switch (error.response?.status) {
      case 401:
        toast.error('Credenciais inválidas. Por favor, verifique seu email e senha.', {
          duration: 4000,
        });
        break;
      case 404:
        toast.error('Recurso não encontrado.', {
          duration: 4000,
        });
        break;
      case 422:
        toast.error('Dados inválidos. Por favor, verifique as informações fornecidas.', {
          duration: 4000,
        });
        break;
      case 500:
        toast.error('Erro interno do servidor. Por favor, tente novamente mais tarde.', {
          duration: 4000,
        });
        break;
      default:
        toast.error(error.message || 'Ocorreu um erro. Por favor, tente novamente.', {
          duration: 4000,
        });
    }
  } else if (error instanceof Error) {
    toast.error(error.message, {
      duration: 4000,
    });
  } else {
    toast.error('Ocorreu um erro desconhecido.', {
      duration: 4000,
    });
  }
};

export const handleSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const handleWarning = (message: string) => {
  toast.warning(message, {
    duration: 3000,
  });
};

export const handleInfo = (message: string) => {
  toast.info(message, {
    duration: 3000,
  });
};