import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Booking {
  created_at: string;
  total_price_numeric?: number;
  total_price?: string;
  paid_amount_numeric?: number;
  paid_amount?: string;
}

interface RevenueChartProps {
  bookings: Booking[];
}

const parseCurrency = (val?: string | number) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(val.replace(/\D/g, '')) || 0;
};

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const RevenueChart: React.FC<RevenueChartProps> = ({ bookings }) => {
  const monthlyData = useMemo(() => {
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
      
      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at);
        const bookingKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
        return bookingKey === monthKey;
      });

      const revenue = monthBookings.reduce((sum, b) => 
        sum + parseCurrency(b.total_price_numeric ?? b.total_price), 0
      );
      
      const paid = monthBookings.reduce((sum, b) => 
        sum + parseCurrency(b.paid_amount_numeric ?? b.paid_amount), 0
      );

      last6Months.push({
        month: monthName,
        revenue,
        paid,
        count: monthBookings.length
      });
    }
    
    return last6Months;
  }, [bookings]);

  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.revenue, d.paid)));
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const growth = previousMonth.revenue > 0 
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#1F2021]">Trend Pendapatan</h3>
          <p className="text-sm text-gray-500 mt-1">6 bulan terakhir</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
          growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {growth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <span className="font-bold text-sm">
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-6">
        {monthlyData.map((data, index) => {
          const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 100 : 0;
          const paidHeight = maxValue > 0 ? (data.paid / maxValue) * 100 : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-700 w-12">{data.month}</span>
                <div className="flex-1 mx-4 flex gap-2 items-end h-12">
                  {/* Revenue Bar */}
                  <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden relative group">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg transition-all duration-500 hover:from-blue-500 hover:to-blue-700"
                      style={{ height: `${revenueHeight}%`, minHeight: data.revenue > 0 ? '4px' : '0' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white drop-shadow">
                          {formatRupiah(data.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Paid Bar */}
                  <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden relative group">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg transition-all duration-500 hover:from-green-500 hover:to-green-700"
                      style={{ height: `${paidHeight}%`, minHeight: data.paid > 0 ? '4px' : '0' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-white drop-shadow">
                          {formatRupiah(data.paid)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">
                  {data.count} booking
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <span className="text-xs font-medium text-gray-600">Total Omzet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-green-400 to-green-600"></div>
          <span className="text-xs font-medium text-gray-600">Pendapatan</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
