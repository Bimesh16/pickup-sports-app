import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  monthlyGrowth: number;
  activeUsers: number;
  totalTransactions: number;
  averageTransaction: number;
  monthlyData: { month: string; revenue: number; transactions: number }[];
  categoryData: { category: string; amount: number; percentage: number }[];
}

const mockAnalyticsData: AnalyticsData = {
  totalRevenue: 45280,
  monthlyGrowth: 12.5,
  activeUsers: 1247,
  totalTransactions: 3456,
  averageTransaction: 13.1,
  monthlyData: [
    { month: 'Jan', revenue: 3200, transactions: 245 },
    { month: 'Feb', revenue: 3800, transactions: 290 },
    { month: 'Mar', revenue: 4200, transactions: 320 },
    { month: 'Apr', revenue: 3900, transactions: 298 },
    { month: 'May', revenue: 4800, transactions: 367 },
    { month: 'Jun', revenue: 5200, transactions: 398 }
  ],
  categoryData: [
    { category: 'Game Fees', amount: 28500, percentage: 63 },
    { category: 'Equipment', amount: 9800, percentage: 22 },
    { category: 'Memberships', amount: 4980, percentage: 11 },
    { category: 'Other', amount: 2000, percentage: 4 }
  ]
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
}> = ({ title, value, change, icon, format = 'number' }) => {
  const formatValue = (val: string | number) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  );
};

const SimpleBarChart: React.FC<{ data: { month: string; revenue: number }[] }> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="w-12 text-sm font-medium text-gray-600">
            {item.month}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div
              className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
            >
              <span className="text-xs text-white font-medium">
                ${item.revenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CategoryChart: React.FC<{ data: { category: string; amount: number; percentage: number }[] }> = ({ data }) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
            <span className="text-sm font-medium text-gray-700">{item.category}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">
              ${item.amount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {item.percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PaymentAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const data = mockAnalyticsData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Analytics</h1>
          <p className="text-gray-600 mt-1">Track your payment performance and revenue insights</p>
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={data.totalRevenue}
          change={data.monthlyGrowth}
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          format="currency"
        />
        <StatCard
          title="Active Users"
          value={data.activeUsers}
          change={8.2}
          icon={<Users className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Total Transactions"
          value={data.totalTransactions}
          change={15.3}
          icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
        />
        <StatCard
          title="Avg Transaction"
          value={data.averageTransaction}
          change={-2.1}
          icon={<Calendar className="h-6 w-6 text-orange-600" />}
          format="currency"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <SimpleBarChart data={data.monthlyData} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Category</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <CategoryChart data={data.categoryData} />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Payment received', amount: '$25.00', user: 'John Doe', time: '2 minutes ago' },
            { action: 'Refund processed', amount: '-$15.00', user: 'Jane Smith', time: '15 minutes ago' },
            { action: 'Payment received', amount: '$30.00', user: 'Mike Johnson', time: '1 hour ago' },
            { action: 'Payment received', amount: '$20.00', user: 'Sarah Wilson', time: '2 hours ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${activity.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {activity.amount}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};