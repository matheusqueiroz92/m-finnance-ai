export interface ReportInsight {
  type: string;
  title: string;
  description: string;
}

export interface FinancialInsights {
  score: {
    value: number;
    change: number;
  };
  health: string;
  potentialSavings: number;
  goalProbability: number;
  insights: ReportInsight[];
}