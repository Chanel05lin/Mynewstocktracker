import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAuthHeaders } from '/utils/auth';

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

interface TransactionFormProps {
  stockCode: string;
  stockName: string;
  onBack: () => void;
  onTransactionAdded: () => void;
  editTransaction?: Transaction | null;
}

export function TransactionForm({ stockCode, stockName, onBack, onTransactionAdded, editTransaction }: TransactionFormProps) {
  const isEditing = !!editTransaction;
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>(editTransaction?.type || 'buy');
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);
  const [inputMode, setInputMode] = useState<'total' | 'unit'>('unit');
  
  // For total mode
  const [totalAmount, setTotalAmount] = useState(editTransaction ? editTransaction.total.toString() : '');
  const [quantity, setQuantity] = useState(editTransaction ? editTransaction.quantity.toString() : '');
  
  // For unit mode
  const [unitPrice, setUnitPrice] = useState(editTransaction ? editTransaction.price.toString() : '');
  const [unitQuantity, setUnitQuantity] = useState(editTransaction ? editTransaction.quantity.toString() : '');
  
  const [loading, setLoading] = useState(false);

  const getCurrencySymbol = () => {
    if (stockCode.startsWith('00') && stockCode.length === 5) {
      return 'HK$';
    }
    return '¥';
  };

  const getFeeRate = () => {
    // Default fee: 0.0115% for stocks, 0.01% for others
    // Assuming most are stocks
    return 0.000115;
  };

  const calculateFromTotal = () => {
    if (!totalAmount || !quantity) return { unitPrice: 0, fees: 0, netTotal: 0 };
    
    const total = parseFloat(totalAmount);
    const qty = parseFloat(quantity);
    
    if (transactionType === 'buy') {
      // For buy: total = (unitPrice * qty) + fees
      // fees = unitPrice * qty * feeRate
      // total = unitPrice * qty * (1 + feeRate)
      // unitPrice = total / (qty * (1 + feeRate))
      const feeRate = getFeeRate();
      const price = total / (qty * (1 + feeRate));
      const fees = price * qty * feeRate;
      return { unitPrice: price, fees, netTotal: total };
    } else {
      // For sell: total = (unitPrice * qty) - fees
      // fees = unitPrice * qty * feeRate
      // total = unitPrice * qty * (1 - feeRate)
      // unitPrice = total / (qty * (1 - feeRate))
      const feeRate = getFeeRate();
      const price = total / (qty * (1 - feeRate));
      const fees = price * qty * feeRate;
      return { unitPrice: price, fees, netTotal: total };
    }
  };

  const calculateFromUnit = () => {
    if (!unitPrice || !unitQuantity) return { fees: 0, total: 0 };
    
    const price = parseFloat(unitPrice);
    const qty = parseFloat(unitQuantity);
    const feeRate = getFeeRate();
    
    const subtotal = price * qty;
    const fees = subtotal * feeRate;
    
    if (transactionType === 'buy') {
      return { fees, total: subtotal + fees };
    } else {
      return { fees, total: subtotal - fees };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPrice: number;
    let finalQuantity: number;
    let finalFees: number;
    let finalTotal: number;

    if (inputMode === 'total') {
      if (!totalAmount || !quantity) {
        alert('请填写总金额和数量');
        return;
      }
      const calculated = calculateFromTotal();
      finalPrice = calculated.unitPrice;
      finalQuantity = parseFloat(quantity);
      finalFees = calculated.fees;
      finalTotal = calculated.netTotal;
    } else {
      if (!unitPrice || !unitQuantity) {
        alert('请填写单价和数量');
        return;
      }
      const calculated = calculateFromUnit();
      finalPrice = parseFloat(unitPrice);
      finalQuantity = parseFloat(unitQuantity);
      finalFees = calculated.fees;
      finalTotal = calculated.total;
    }

    try {
      setLoading(true);

      const url = isEditing
        ? `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/transactions/${editTransaction.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-08a91c5a/transactions`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          stockCode,
          stockName,
          type: transactionType,
          price: finalPrice,
          quantity: finalQuantity,
          date,
          fees: finalFees,
          total: finalTotal
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} transaction`);
      }

      onTransactionAdded();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} transaction:`, error);
      alert(`${isEditing ? '更新' : '添加'}交易记录失败，请重试`);
    } finally {
      setLoading(false);
    }
  };

  const currentCalculation = inputMode === 'total' ? calculateFromTotal() : calculateFromUnit();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#E2E8F0]">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-[#1A3A5F]" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-base font-semibold text-[#1A3A5F]">{isEditing ? '编辑交易' : '添加交易'}</div>
          <div className="text-xs text-[#A0AEC0]">{stockCode} {stockName}</div>
        </div>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F7FAFC] p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
              交易类型 *
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('buy')}
                className={`flex-1 py-2 px-4 rounded-full font-medium transition-colors ${
                  transactionType === 'buy'
                    ? 'bg-[#38A169] text-white'
                    : 'bg-white text-[#4A5568] border border-[#E2E8F0]'
                }`}
              >
                买入
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('sell')}
                className={`flex-1 py-2 px-4 rounded-full font-medium transition-colors ${
                  transactionType === 'sell'
                    ? 'bg-[#E53E3E] text-white'
                    : 'bg-white text-[#4A5568] border border-[#E2E8F0]'
                }`}
              >
                卖出
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
              交易日期 *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#EDF2F7] rounded border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
            />
          </div>

          {/* Input Mode Toggle */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
              输入方式
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputMode('total')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  inputMode === 'total'
                    ? 'bg-[#1A3A5F] text-white'
                    : 'bg-white text-[#4A5568] border border-[#E2E8F0]'
                }`}
              >
                总金额
              </button>
              <button
                type="button"
                onClick={() => setInputMode('unit')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                  inputMode === 'unit'
                    ? 'bg-[#1A3A5F] text-white'
                    : 'bg-white text-[#4A5568] border border-[#E2E8F0]'
                }`}
              >
                单价
              </button>
            </div>
          </div>

          {/* Input Fields */}
          {inputMode === 'total' ? (
            <>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
                  {transactionType === 'buy' ? '买入总金额 *' : '卖出总金额 *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#4A5568]">
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 bg-[#EDF2F7] rounded border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
                  />
                </div>
                <div className="mt-1 text-xs text-[#A0AEC0]">
                  {transactionType === 'buy' ? '包含手续费的总金额' : '扣除手续费后的总金额'}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
                  数量（股） *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#EDF2F7] rounded border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
                />
              </div>

              {totalAmount && quantity && (
                <div className="bg-[#F7FAFC] rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0AEC0]">计算单价</span>
                    <span className="font-medium text-[#4A5568]">
                      {getCurrencySymbol()}{currentCalculation.unitPrice.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0AEC0]">手续费 (0.0115%)</span>
                    <span className="font-medium text-[#4A5568]">
                      {getCurrencySymbol()}{currentCalculation.fees.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
                  成交单价 *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#4A5568]">
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 bg-[#EDF2F7] rounded border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
                  数量（股） *
                </label>
                <input
                  type="number"
                  value={unitQuantity}
                  onChange={(e) => setUnitQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#EDF2F7] rounded border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
                />
              </div>

              {unitPrice && unitQuantity && (
                <div className="bg-[#F7FAFC] rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0AEC0]">小计</span>
                    <span className="font-medium text-[#4A5568]">
                      {getCurrencySymbol()}{(parseFloat(unitPrice) * parseFloat(unitQuantity)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0AEC0]">手续费 (0.0115%)</span>
                    <span className="font-medium text-[#4A5568]">
                      {getCurrencySymbol()}{currentCalculation.fees.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[#1A3A5F]">总金额</span>
                    <span className="text-[#1A3A5F]">
                      {getCurrencySymbol()}{currentCalculation.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A3A5F] text-white py-3 rounded-full font-medium hover:bg-[#2d5a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : (isEditing ? '确认更新' : '确认添加')}
          </button>
        </form>
      </div>
    </div>
  );
}
