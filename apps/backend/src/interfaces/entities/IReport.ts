export interface IReportFileResult {
    filePath: string;
    fileName: string;
  }
  
  export interface IReportInsight {
    type: string;
    title: string;
    description: string;
  }
  
  export interface IFinancialInsights {
    score: {
      value: number;
      change: number;
    };
    health: string;
    potentialSavings: number;
    goalProbability: number;
    insights: IReportInsight[];
  }