import api from "@/lib/api/axios";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { ApiResponse } from "@/types/api-response";
import type { ConsultantMessage, ConsultantReply } from "@/types/consultant";

export interface SendConsultantMessageParams {
  message: string;
  history?: ConsultantMessage[];
  useUserContext?: boolean;
}

export const sendConsultantMessage = async (
  params: SendConsultantMessageParams | string,
  history?: ConsultantMessage[]
): Promise<ConsultantReply> => {
  const payload =
    typeof params === "string"
      ? { message: params, history: history ?? [], useUserContext: true }
      : {
          message: params.message,
          history: params.history ?? [],
          useUserContext: params.useUserContext !== false,
        };
  const response = await api.post<ApiResponse<ConsultantReply>>(
    API_ROUTES.CONSULTANT.CHAT,
    payload
  );
  return response.data.data;
};
