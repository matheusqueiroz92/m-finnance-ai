import api from "@/lib/api/axios";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { ApiResponse } from "@/types/api-response";
import type { ConsultantMessage, ConsultantReply } from "@/types/consultant";

export const sendConsultantMessage = async (
  message: string,
  history?: ConsultantMessage[]
): Promise<ConsultantReply> => {
  const response = await api.post<ApiResponse<ConsultantReply>>(
    API_ROUTES.CONSULTANT.CHAT,
    { message, history: history ?? [] }
  );
  return response.data.data;
};
