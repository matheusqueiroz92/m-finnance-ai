import { TransactionModelClass } from '../models/TransactionModel';
import { UserModelClass } from '../models/UserModel';
import { GoalModelClass } from '../models/GoalModel';

export class AIAnalysisService {
  private transactionModel: TransactionModelClass;
  private userModel: UserModelClass;
  private goalModel: GoalModelClass;

  constructor() {
    this.transactionModel = new TransactionModelClass();
    this.userModel = new UserModelClass();
    this.goalModel = new GoalModelClass();
  }

  /**
   * Generate financial insights based on user transactions
   */
  async generateInsights(userId: string): Promise<any> {
    try {
      // Get user's transactions for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      // Usar as instâncias da classe em vez de usar as classes diretamente
      // Usar o método apropriado do TransactionModelClass
      const transactions = await this.transactionModel.findByDateRange(
        userId,
        threeMonthsAgo,
        new Date()
      );
      
      // Usar o método apropriado do GoalModelClass
      const goals = await this.goalModel.findByUser(userId, false);
      
      // Prepare data for AI analysis
      const analysisData = {
        transactions: transactions.map((t: { amount: any; type: any; category: any; description: any; date: any; }) => ({
          amount: t.amount,
          type: t.type,
          category: t.category ? (t.category as any).name : null,
          description: t.description,
          date: t.date,
        })),
        goals: goals.map((g: { name: any; targetAmount: any; currentAmount: any; progress: any; targetDate: any; }) => ({
          name: g.name,
          targetAmount: g.targetAmount,
          currentAmount: g.currentAmount,
          progress: g.progress,
          targetDate: g.targetDate,
        })),
      };
      
      // Send data to AI service for analysis
      // Note: This is a simplified example. In a real application, you would integrate with an AI service API
      // For demonstration, we'll create mock insights
      
      // In a real implementation, you might use:
      // const aiResponse = await axios.post('https://your-ai-service-api.com/analyze', analysisData);
      // return aiResponse.data;
      
      // For now, generate mock insights
      return this.generateMockInsights(analysisData);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      throw error;
    }
  }
  
  /**
   * Generate mock insights (for demonstration)
   * In a real application, this would be replaced with actual AI service integration
   */
  private generateMockInsights(data: any): any {
    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpenses: Record<string, number> = {};
    
    data.transactions.forEach((t: any) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpenses += t.amount;
        
        if (t.category) {
          if (!categoryExpenses[t.category]) {
            categoryExpenses[t.category] = 0;
          }
          categoryExpenses[t.category] += t.amount;
        }
      }
    });
    
    // Find top spending categories
    const topCategories = Object.entries(categoryExpenses)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);
    
    // Find potentially excessive spending
    const insights = [];
    
    const foodDeliveryExpenses = categoryExpenses['Alimentação'] || 0;
    if (foodDeliveryExpenses > 0.15 * totalIncome) {
      insights.push({
        type: 'optimization',
        title: 'Otimização de Gastos',
        description: `Identificamos que seus gastos com delivery aumentaram 45% no último mês. Sugerimos estabelecer um limite mensal de R$ 300 para esta categoria.`,
      });
    }
    
    // Investment opportunity
    if (totalIncome > totalExpenses * 1.3) {
      insights.push({
        type: 'investment',
        title: 'Oportunidade de Investimento',
        description: `Com base no seu perfil de risco e objetivos, recomendamos aumentar sua exposição em fundos multimercado em 10%.`,
      });
    }
    
    // Goal prediction
    if (data.goals.length > 0) {
      const carGoal = data.goals.find((g: any) => g.name.toLowerCase().includes('carro'));
      if (carGoal) {
        insights.push({
          type: 'goal',
          title: 'Previsão de Objetivos',
          description: `Mantendo o ritmo atual de economia, você atingirá sua meta para compra do carro 2 meses antes do previsto.`,
        });
      }
    }
    
    // Financial score calculation (simplified)
    const savingsRate = (totalIncome - totalExpenses) / totalIncome;
    const score = Math.min(850, Math.max(300, Math.round(500 + savingsRate * 500)));
    
    // Random value for potential savings
    const potentialSavings = Math.round(totalExpenses * 0.08 * 100) / 100;
    
    // Calculate goal probability
    const goalProbability = data.goals.length > 0 
      ? Math.min(99, Math.round(Math.random() * 30 + 60))
      : 0;
    
    return {
      score: {
        value: score,
        change: Math.round(Math.random() * 30 - 10),
      },
      health: score > 700 ? 'Ótima' : score > 600 ? 'Boa' : score > 500 ? 'Regular' : 'Precisa de atenção',
      potentialSavings,
      goalProbability,
      insights,
    };
  }
}