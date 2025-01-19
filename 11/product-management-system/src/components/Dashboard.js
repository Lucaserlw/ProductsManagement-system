import React, { useMemo } from 'react';

export const Dashboard = ({ orders }) => {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return orders.reduce((acc, order) => {
      const orderDate = new Date(order.date);
      orderDate.setHours(0, 0, 0, 0);
      
      // 今日数据
      if (orderDate.getTime() === today.getTime()) {
        acc.today.orders++;
        acc.today.revenue += order.totalAmount;
        acc.today.profit += order.totalProfit;
      }
      
      // 本月数据
      if (orderDate >= thisMonth) {
        acc.month.orders++;
        acc.month.revenue += order.totalAmount;
        acc.month.profit += order.totalProfit;
      }
      
      // 累计数据
      acc.total.orders++;
      acc.total.revenue += order.totalAmount;
      acc.total.profit += order.totalProfit;
      
      return acc;
    }, {
      today: { orders: 0, revenue: 0, profit: 0 },
      month: { orders: 0, revenue: 0, profit: 0 },
      total: { orders: 0, revenue: 0, profit: 0 }
    });
  }, [orders]);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stats-card today">
          <h3>今日数据</h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="label">订单数</span>
              <span className="value">{stats.today.orders}</span>
            </div>
            <div className="stat-item">
              <span className="label">营业额</span>
              <span className="value">¥{stats.today.revenue.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="label">利润</span>
              <span className="value">¥{stats.today.profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="stats-card month">
          <h3>本月数据</h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="label">订单数</span>
              <span className="value">{stats.month.orders}</span>
            </div>
            <div className="stat-item">
              <span className="label">营业额</span>
              <span className="value">¥{stats.month.revenue.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="label">利润</span>
              <span className="value">¥{stats.month.profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="stats-card total">
          <h3>累计数据</h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="label">订单数</span>
              <span className="value">{stats.total.orders}</span>
            </div>
            <div className="stat-item">
              <span className="label">营业额</span>
              <span className="value">¥{stats.total.revenue.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="label">利润</span>
              <span className="value">¥{stats.total.profit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 