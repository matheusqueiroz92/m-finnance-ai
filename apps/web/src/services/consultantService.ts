import api from "@/lib/api/axios";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { ApiResponse } from "@/types/api-response";
import type {
  ConsultantMessage,
  ConsultantReply,
  ConsultantSession,
  ConsultantSessionWithMessages,
} from "@/types/consultant";

export interface SendConsultantMessageParams {
  message: string;
  history?: ConsultantMessage[];
  useUserContext?: boolean;
  sessionId?: string;
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
          sessionId: params.sessionId,
        };
  const response = await api.post<ApiResponse<ConsultantReply>>(
    API_ROUTES.CONSULTANT.CHAT,
    payload
  );
  return response.data.data;
};

export const createConsultantSession = async (): Promise<{
  sessionId: string;
  title: string;
}> => {
  const response = await api.post<
    ApiResponse<{ sessionId: string; title: string }>
  >(API_ROUTES.CONSULTANT.SESSIONS);
  return response.data.data;
};

export const getConsultantSessions = async (): Promise<
  ConsultantSession[]
> => {
  const response = await api.get<ApiResponse<{ sessions: ConsultantSession[] }>>(
    API_ROUTES.CONSULTANT.SESSIONS
  );
  return response.data.data.sessions;
};

export const getConsultantSession = async (
  sessionId: string
): Promise<ConsultantSessionWithMessages> => {
  const response = await api.get<
    ApiResponse<{ session: ConsultantSessionWithMessages }>
  >(API_ROUTES.CONSULTANT.SESSION_DETAIL(sessionId));
  return response.data.data.session;
};
