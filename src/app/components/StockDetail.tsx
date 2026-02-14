import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAuthHeaders } from '/utils/auth';
import { TransactionForm } from './TransactionForm';

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
}

interface StockDetailProps {
  stockCode: string;
  stockName: string;
  onBack: () => void;
  onUpdate: () => void;
}

export function StockDetail({ stockCode, stockName, onBack, onUpdate }: StockDetailProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [changePercent, setChangePercent] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Holdings calculation
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [averageCost, setAverageCost] = useState(0);
  const [marketValue, setMarketValue] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [profitLossPercent, setProfitLossPercent] = useState(0);

  useEffect(() => {
    loadData();
  }, [stockCode]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch current price
      const endpoint = stockCode.startsWith('00') && stockCode.length === 5 
        ? 'hk-stock' 
        : 'stock';
      
      const stockResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/${endpoint}/${stockCode}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      let stockData = null;
      if (stockResponse.ok) {
        stockData = await stockResponse.json();
        setCurrentPrice(stockData.price);
        setChangePercent(stockData.changePercent || 0);
      }

      // Fetch transactions
      const txResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            ...getAuthHeaders()
          }
        }
      );

      if (txResponse.ok) {
        const txData = await txResponse.json();
        const stockTransactions = (txData.transactions || [])
          .filter((tx: Transaction) => tx.stockCode === stockCode)
          .sort((a: Transaction, b: Transaction) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        
        setTransactions(stockTransactions);

        // Calculate holdings
        let qty = 0;
        let totalCost = 0;

        stockTransactions.forEach((tx: Transaction) => {
          if (tx.type === 'buy') {
            qty += tx.quantity;
            totalCost += tx.total;
          } else {
            qty -= tx.quantity;
            totalCost -= tx.total;
          }
        });

        setTotalQuantity(qty);
        
        if (qty > 0) {
          const avgCost = totalCost / qty;
          setAverageCost(avgCost);
          
          if (stockData) {
            const mktValue = stockData.price * qty;
            const pl = mktValue - totalCost;
            const plPercent = (pl / totalCost) * 100;
            
            setMarketValue(mktValue);
            setProfitLoss(pl);
            setProfitLossPercent(plPercent);
          }
        } else {
          setAverageCost(0);
          setMarketValue(0);
          setProfitLoss(0);
          setProfitLossPercent(0);
        }
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
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
        `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/transactions/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            ...getAuthHeaders()
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      await loadData();
      onUpdate();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('删除失败，请重试');
    }
  };

  const handleTransactionAdded = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
    loadData();
    onUpdate();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const getCurrencySymbol = () => {
    if (stockCode.startsWith('00') && stockCode.length === 5) {
      return 'HK$';
    }
    return '¥';
  };

  if (showTransactionForm) {
    return (
      <TransactionForm
        stockCode={stockCode}
        stockName={stockName}
        onBack={() => {
          setShowTransactionForm(false);
          setEditingTransaction(null);
        }}
        onTransactionAdded={handleTransactionAdded}
        editTransaction={editingTransaction}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#E2E8F0]">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-[#1A3A5F]" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-base font-semibold text-[#1A3A5F]">{stockCode}</div>
          <div className="text-xs text-[#A0AEC0]">{stockName}</div>
        </div>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F7FAFC] p-4">
        {/* Price Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          {currentPrice !== null && (
            <>
              <div className="text-3xl font-bold text-[#1A3A5F] mb-2">
                {getCurrencySymbol()}{currentPrice.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${changePercent >= 0 ? 'text-[#38A169]' : 'text-[#E53E3E]'}`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
            </>
          )}
        </div>

        {/* Holdings Card */}
        {totalQuantity > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="text-sm font-medium text-[#1A3A5F] mb-3">持仓信息</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#A0AEC0] mb-1">持仓数量</div>
                <div className="text-base font-semibold text-[#4A5568]">{totalQuantity} 股</div>
              </div>
              <div>
                <div className="text-xs text-[#A0AEC0] mb-1">成本价</div>
                <div className="text-base font-semibold text-[#4A5568]">
                  {getCurrencySymbol()}{averageCost.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#A0AEC0] mb-1">市值</div>
                <div className="text-base font-semibold text-[#4A5568]">
                  {getCurrencySymbol()}{marketValue.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#A0AEC0] mb-1">盈亏</div>
                <div className={`text-base font-semibold ${profitLoss >= 0 ? 'text-[#38A169]' : 'text-[#E53E3E]'}`}>
                  {profitLoss >= 0 ? '+' : ''}{getCurrencySymbol()}{Math.abs(profitLoss).toFixed(2)}
                  <span className="text-sm ml-1">({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Transaction Button */}
        <button
          onClick={() => setShowTransactionForm(true)}
          className="w-full mb-4 bg-[#1A3A5F] text-white py-3 rounded-full font-medium hover:bg-[#2d5a8f] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          添加交易记录
        </button>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#EDF2F7]">
            <h3 className="text-sm font-medium text-[#1A3A5F]">交易历史</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-[#A0AEC0]">加载中...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-[#A0AEC0]">暂无交易记录</div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === 'buy'
                              ? 'bg-[#38A169] text-white'
                              : 'bg-[#E53E3E] text-white'
                          }`}
                        >
                          {tx.type === 'buy' ? '买入' : '卖出'}
                        </span>
                        <span className="text-sm text-[#A0AEC0]">
                          {new Date(tx.date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-sm text-[#4A5568]">
                        {getCurrencySymbol()}{tx.price.toFixed(2)} × {tx.quantity} 股
                      </div>
                      {tx.fees > 0 && (
                        <div className="text-xs text-[#A0AEC0] mt-1">
                          手续费: {getCurrencySymbol()}{tx.fees.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-semibold mb-2 ${
                        tx.type === 'buy' ? 'text-[#E53E3E]' : 'text-[#38A169]'
                      }`}>
                        {tx.type === 'buy' ? '-' : '+'}{getCurrencySymbol()}{tx.total.toFixed(2)}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTransaction(tx)}
                          className="text-[#4299E1] p-1 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="text-[#E53E3E] p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
