import api from "@/lib/api/axios";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { ApiResponse } from "@/types/api-response";
import type {
  FinancialPlan,
  SimulationResult,
  AdherenceResult,
} from "@/types/planning";

export const getPlan = async (): Promise<FinancialPlan> => {
  const response = await api.get<ApiResponse<FinancialPlan>>(
    API_ROUTES.PLANNING.PLAN
  );
  return response.data.data;
};

export const simulateScenario = async (
  savingsPercent: number,
  months: number
): Promise<SimulationResult> => {
  const response = await api.get<ApiResponse<SimulationResult>>(
    `${API_ROUTES.PLANNING.SIMULATE}?savingsPercent=${savingsPercent}&months=${months}`
  );
  return response.data.data;
};

export const getAdherence = async (): Promise<AdherenceResult> => {
  const response = await api.get<ApiResponse<AdherenceResult>>(
    API_ROUTES.PLANNING.ADHERENCE
  );
  return response.data.data;
};
