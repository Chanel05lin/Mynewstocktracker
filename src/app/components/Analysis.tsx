import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getAuthHeaders } from '../../../utils/auth';

interface Transaction {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  date: string;
  fees: number;
  total: number;
  createdAt: string;
}

export function Analysis() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            ...getAuthHeaders()
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      const sorted = (data.transactions || []).sort((a: Transaction, b: Transaction) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sorted);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('确定要删除这条交易记录吗？')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/transactions/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('删除失败，请重试');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getCurrencySymbol = (code: string) => {
    if (code.startsWith('00') && code.length === 5) {
      return 'HK$';
    }
    return '¥';
  };

  const totalBuyAmount = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + t.total, 0);

  const totalSellAmount = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + t.total, 0);

  const netInvestment = totalBuyAmount - totalSellAmount;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#E2E8F0]">
        <h1 className="text-lg font-semibold text-[#1A3A5F]">交易分析</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F7FAFC] p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[#38A169]" />
              <span className="text-xs text-[#A0AEC0]">累计买入</span>
            </div>
            <div className="text-xl font-bold text-[#1A3A5F]">
              ¥{totalBuyAmount.toFixed(2)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-[#E53E3E]" />
              <span className="text-xs text-[#A0AEC0]">累计卖出</span>
            </div>
            <div className="text-xl font-bold text-[#1A3A5F]">
              ¥{totalSellAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="text-xs text-[#A0AEC0] mb-1">净投入</div>
          <div className={`text-2xl font-bold ${netInvestment >= 0 ? 'text-[#1A3A5F]' : 'text-[#E53E3E]'}`}>
            ¥{netInvestment.toFixed(2)}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#1A3A5F] text-white'
                : 'bg-white text-[#4A5568] border border-[#E2E8F0]'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('buy')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'buy'
                ? 'bg-[#38A169] text-white'
                : 'bg-white text-[#4A5568] border border-[#E2E8F0]'
            }`}
          >
            买入
          </button>
          <button
            onClick={() => setFilter('sell')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'sell'
                ? 'bg-[#E53E3E] text-white'
                : 'bg-white text-[#4A5568] border border-[#E2E8F0]'
            }`}
          >
            卖出
          </button>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#A0AEC0]">加载中...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[#A0AEC0] mb-2">暂无交易记录</div>
              <div className="text-sm text-[#A0AEC0]">点击"交易"添加您的第一笔交易</div>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">
              {filteredTransactions.map((transaction) => {
                const currency = getCurrencySymbol(transaction.stockCode);
                
                return (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-medium text-[#1A3A5F]">
                            {transaction.stockCode}
                          </span>
                          <span className="text-sm text-[#4A5568]">
                            {transaction.stockName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'buy'
                                ? 'bg-[#38A169] text-white'
                                : 'bg-[#E53E3E] text-white'
                            }`}
                          >
                            {transaction.type === 'buy' ? '买入' : '卖出'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-[#A0AEC0]">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(transaction.date).toLocaleDateString('zh-CN')}
                          </span>
                          <span>
                            {currency}{transaction.price.toFixed(2)} × {transaction.quantity}股
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-base font-semibold ${
                          transaction.type === 'buy' ? 'text-[#E53E3E]' : 'text-[#38A169]'
                        }`}>
                          {transaction.type === 'buy' ? '-' : '+'}{currency}{transaction.total.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-xs text-[#E53E3E] hover:underline mt-1"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    
                    {transaction.fees > 0 && (
                      <div className="text-xs text-[#A0AEC0]">
                        手续费: {currency}{transaction.fees.toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
