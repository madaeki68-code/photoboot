import React, { useMemo } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Booking {
  status: string;
}

interface StatusPieChartProps {
  bookings: Booking[];
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ bookings }) => {
  const statusData = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const total = bookings.length || 1;

    return [
      {
        label: 'Terkonfirmasi',
        count: confirmed,
        percentage: (confirmed / total) * 100,
        color: 'bg-green-500',
        icon: CheckCircle2,
        textColor: 'text-green-600'
      },
      {
        label: 'Pending',
        count: pending,
        percentage: (pending / total) * 100,
        color: 'bg-orange-500',
        icon: Clock,
        textColor: 'text-orange-600'
      },
      {
        label: 'Dibatalkan',
        count: cancelled,
        percentage: (cancelled / total) * 100,
        color: 'bg-red-500',
        icon: XCircle,
        textColor: 'text-red-600'
      }
    ];
  }, [bookings]);

  // Calculate pie chart segments
  let currentAngle = -90; // Start from top
  const segments = statusData.map(data => {
    const angle = (data.percentage / 100) * 360;
    const segment = {
      ...data,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return segment;
  });

  const createArcPath = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h3 className="text-xl font-bold tracking-tight text-[#1F2021] mb-2">Status Booking</h3>
      <p className="text-sm text-gray-500 mb-8">Distribusi status pesanan</p>

      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 200 200" className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createArcPath(segment.startAngle, segment.endAngle)}
                className={`${segment.color.replace('bg-', 'fill-')} hover:opacity-80 transition-opacity cursor-pointer`}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
            ))}
            {/* Center circle */}
            <circle cx="100" cy="100" r="50" className="fill-white" />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#1F2021]">{bookings.length}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {statusData.map((data, index) => {
          const Icon = data.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${data.color}`}></div>
                <Icon size={16} className={data.textColor} />
                <span className="text-sm font-medium text-gray-700">{data.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#1F2021]">{data.count}</span>
                <span className="text-xs text-gray-400 w-12 text-right">
                  {data.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusPieChart;
