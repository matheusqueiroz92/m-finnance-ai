export interface IOperationResult {
    success: boolean;
    message?: string;
    data?: any;
  }
  
  export interface IPaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }