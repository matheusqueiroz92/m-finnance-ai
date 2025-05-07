import { useToast } from "@/components/ui/use-toast";

export function useNotification() {
  const { toast } = useToast();

  const showSuccess = (message: string, title: string = "Sucesso!") => {
    toast({
      title,
      description: message,
      variant: "default",
      className: "bg-green-50 border-green-300 text-green-800",
    });
  };

  const showError = (message: string, title: string = "Erro!") => {
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  };

  const showInfo = (message: string, title?: string) => {
    toast({
      title,
      description: message,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
  };
}