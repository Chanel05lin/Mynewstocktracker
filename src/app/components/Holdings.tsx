import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getAuthHeaders } from '../../../utils/auth';
import { AddStockModal } from './AddStockModal';
import { StockDetail } from './StockDetail';

interface WatchlistStock {
  stockCode: string;
  stockName: string;
}

interface StockData {
  code: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  totalQuantity: number;
  averageCost: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function Holdings() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ code: string; name: string } | null>(null);
  const [totalAssets, setTotalAssets] = useState(0);
  const [todayProfitLoss, setTodayProfitLoss] = useState(0);
  const [totalReturn, setTotalReturn] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch watchlist
      let watchlist: WatchlistStock[] = [];
      try {
        const watchlistResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/watchlist`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              ...getAuthHeaders()
            }
          }
        );

        if (watchlistResponse.ok) {
          const watchlistData = await watchlistResponse.json();
          watchlist = watchlistData.watchlist || [];
        } else {
          console.log('Watchlist empty or not found, starting fresh');
        }
      } catch (error) {
        console.log('Error fetching watchlist, starting fresh:', error);
      }

      // Fetch portfolio holdings
      let holdings: any[] = [];
      try {
        const portfolioResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/portfolio`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              ...getAuthHeaders()
            }
          }
        );

        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          holdings = portfolioData.holdings || [];
        } else {
          console.log('Portfolio empty or not found');
        }
      } catch (error) {
        console.log('Error fetching portfolio:', error);
      }

      // Combine watchlist and holdings
      const allStockCodes = new Set([
        ...watchlist.map((s: WatchlistStock) => s.stockCode),
        ...holdings.map((h: any) => h.stockCode)
      ]);

      // Fetch current prices and combine data
      const stocksData = await Promise.all(
        Array.from(allStockCodes).map(async (stockCode) => {
          const watchlistItem = watchlist.find((s: WatchlistStock) => s.stockCode === stockCode);
          const holding = holdings.find((h: any) => h.stockCode === stockCode);
          
          const stockName = watchlistItem?.stockName || holding?.stockName || stockCode;

          try {
            const endpoint = stockCode.startsWith('00') && stockCode.length === 5
              ? 'hk-stock'
              : 'stock';
            
            const stockResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/server/${endpoint}/${stockCode}`,
              {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`
                }
              }
            );

            if (stockResponse.ok) {
              const stockData = await stockResponse.json();
              const currentPrice = stockData.price;
              const changePercent = stockData.changePercent || 0;

              if (holding) {
                const marketValue = currentPrice * holding.totalQuantity;
                const costBasis = holding.averageCost * holding.totalQuantity;
                const profitLoss = marketValue - costBasis;
                const profitLossPercent = (profitLoss / costBasis) * 100;

                return {
                  code: stockCode,
                  name: stockName,
                  currentPrice,
                  changePercent,
                  totalQuantity: holding.totalQuantity,
                  averageCost: holding.averageCost,
                  marketValue,
                  profitLoss,
                  profitLossPercent
                };
              } else {
                // Watchlist only, no holdings
                return {
                  code: stockCode,
                  name: stockName,
                  currentPrice,
                  changePercent,
                  totalQuantity: 0,
                  averageCost: 0,
                  marketValue: 0,
                  profitLoss: 0,
                  profitLossPercent: 0
                };
              }
            }
          } catch (error) {
            console.error(`Failed to fetch price for ${stockCode}:`, error);
          }
          
          return null;
        })
      );

      const validStocks = stocksData.filter((s): s is StockData => s !== null);
      
      // Sort: holdings first, then watchlist
      validStocks.sort((a, b) => {
        if (a.totalQuantity > 0 && b.totalQuantity === 0) return -1;
        if (a.totalQuantity === 0 && b.totalQuantity > 0) return 1;
        return b.marketValue - a.marketValue;
      });

      setStocks(validStocks);

      // Calculate totals (only from holdings)
      const total = validStocks
        .filter(s => s.totalQuantity > 0)
        .reduce((sum, s) => sum + s.marketValue, 0);
      
      const totalCost = validStocks
        .filter(s => s.totalQuantity > 0)
        .reduce((sum, s) => sum + (s.averageCost * s.totalQuantity), 0);
      
      const totalProfit = total - totalCost;
      const totalReturnPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

      setTotalAssets(total);
      setTodayProfitLoss(totalProfit);
      setTotalReturn(totalReturnPercent);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    if (code.startsWith('00') && code.length === 5) {
      return 'HK$';
    }
    return '¥';
  };

  if (selectedStock) {
    return (
      <StockDetail
        stockCode={selectedStock.code}
        stockName={selectedStock.name}
        onBack={() => setSelectedStock(null)}
        onUpdate={loadData}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#E2E8F0]">
        <h1 className="text-lg font-semibold text-[#1A3A5F]">My Stock</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Plus size={24} className="text-[#1A3A5F]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F7FAFC] p-4">
        {/* Overview Card - Only show if there are holdings */}
        {totalAssets > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="mb-4">
              <div className="text-sm text-[#A0AEC0] mb-1">总资产</div>
              <div className="text-3xl font-bold text-[#1A3A5F]">
                ¥{totalAssets.toFixed(2)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#A0AEC0] mb-1">持仓盈亏</div>
                <div className={`text-lg font-semibold ${todayProfitLoss >= 0 ? 'text-[#38A169]' : 'text-[#E53E3E]'}`}>
                  {todayProfitLoss >= 0 ? '+' : ''}¥{todayProfitLoss.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#A0AEC0] mb-1">总收益率</div>
                <div className={`text-lg font-semibold ${totalReturn >= 0 ? 'text-[#38A169]' : 'text-[#E53E3E]'}`}>
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#A0AEC0]">加载中...</div>
          ) : stocks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[#A0AEC0] mb-2">暂无股票</div>
              <div className="text-sm text-[#A0AEC0]">点击右上角"+"添加您关注的股票</div>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">
              {stocks.map((stock) => {
                const currency = getCurrencySymbol(stock.code);
                const isHolding = stock.totalQuantity > 0;
                
                return (
                  <div
                    key={stock.code}
                    onClick={() => setSelectedStock({ code: stock.code, name: stock.name })}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-medium text-[#1A3A5F]">{stock.code}</span>
                          <span className="text-sm text-[#4A5568]">{stock.name}</span>
                          {!isHolding && (
                            <span className="text-xs text-[#A0AEC0] px-2 py-0.5 bg-[#F7FAFC] rounded">
                              观察中
                            </span>
                          )}
                        </div>
                        {isHolding && (
                          <div className="text-xs text-[#A0AEC0] mt-1">
                            持仓: {stock.totalQuantity} 股 · 成本: {currency}{stock.averageCost.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-[#1A3A5F]">
                          {currency}{stock.currentPrice.toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium flex items-center justify-end gap-1 ${
                          stock.changePercent >= 0 ? 'text-[#38A169]' : 'text-[#E53E3E]'
                        }`}>
                          {stock.changePercent >= 0 ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    {isHolding && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-[#4A5568]">
                          市值: {currency}{stock.marketValue.toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium ${
                          stock.profitLoss >= 0 ? 'text-[#38A169]' : 'text-[#E53E3E]'
                        }`}>
                          {stock.profitLoss >= 0 ? '+' : ''}{currency}{Math.abs(stock.profitLoss).toFixed(2)}
                          <span className="text-xs ml-1">
                            ({stock.profitLoss >= 0 ? '+' : ''}{stock.profitLossPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          onStockAdded={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
