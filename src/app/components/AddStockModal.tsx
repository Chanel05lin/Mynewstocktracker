import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getAuthHeaders } from '../../../utils/auth';

interface AddStockModalProps {
  onClose: () => void;
  onStockAdded: () => void;
}

interface StockSearchResult {
  code: string;
  name: string;
  price: number;
}

export function AddStockModal({ onClose, onStockAdded }: AddStockModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<StockSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 5) {
      setError('请输入有效的股票代码');
      return;
    }

    try {
      setSearching(true);
      setError('');
      
      const endpoint = searchQuery.startsWith('00') && searchQuery.length === 5 
        ? 'hk-stock' 
        : 'stock';
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/${endpoint}/${searchQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('未找到该股票');
      }

      const data = await response.json();
      setSearchResult({
        code: searchQuery,
        name: data.name,
        price: data.price
      });
    } catch (err) {
      setError('未找到该股票，请检查代码是否正确');
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleAddStock = async () => {
    if (!searchResult) return;

    try {
      // Save to watchlist
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/watchlist`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            stockCode: searchResult.code,
            stockName: searchResult.name
          })
        }
      );

      if (!response.ok) {
        throw new Error('添加失败');
      }

      onStockAdded();
      onClose();
    } catch (err) {
      alert('添加股票失败，请重试');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[340px] max-h-[500px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#1A3A5F]">添加股票</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} className="text-[#4A5568]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
              股票代码
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入股票代码"
                className="flex-1 px-3 py-2 bg-[#EDF2F7] rounded border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-[#1A3A5F] text-white rounded hover:bg-[#2d5a8f] transition-colors disabled:opacity-50"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          {searchResult && (
            <div className="mb-4 p-4 bg-[#F7FAFC] rounded border border-[#E2E8F0]">
              <div className="mb-2">
                <div className="text-base font-semibold text-[#1A3A5F]">
                  {searchResult.code}
                </div>
                <div className="text-sm text-[#4A5568]">{searchResult.name}</div>
              </div>
              <div className="text-lg font-bold text-[#1A3A5F]">
                {searchResult.code.startsWith('00') && searchResult.code.length === 5 ? 'HK$' : '¥'}
                {searchResult.price.toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white text-[#4A5568] border border-[#E2E8F0] rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddStock}
              disabled={!searchResult}
              className="flex-1 px-4 py-2 bg-[#1A3A5F] text-white rounded-full font-medium hover:bg-[#2d5a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
