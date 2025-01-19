import React, { useMemo } from 'react';

export const Statistics = ({ orders, products }) => {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return orders.reduce((acc, order) => {
      const orderDate = new Date(order.date);
      
      // 计算总计
      acc.totalOrders++;
      acc.totalRevenue += order.totalAmount;
      acc.totalProfit += order.totalProfit;
      
      // 计算今日数据
      if (orderDate >= today) {
        acc.todayOrders++;
        acc.todayRevenue += order.totalAmount;
        acc.todayProfit += order.totalProfit;
      }
      
      // 计算本月数据
      if (orderDate >= thisMonth) {
        acc.monthOrders++;
        acc.monthRevenue += order.totalAmount;
        acc.monthProfit += order.totalProfit;
      }
      
      // 统计商品销量
      order.items.forEach(item => {
        if (!acc.productSales[item.productId]) {
          acc.productSales[item.productId] = {
            quantity: 0,
            revenue: 0,
            profit: 0
          };
        }
        acc.productSales[item.productId].quantity += item.quantity;
        acc.productSales[item.productId].revenue += item.sellingPrice * item.quantity;
        
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const shippingFee = item.isRemoteArea ? product.shippingFeeRemote : product.shippingFeeNormal;
          acc.productSales[item.productId].profit += (item.sellingPrice - product.cost - shippingFee) * item.quantity;
        }
      });
      
      return acc;
    }, {
      totalOrders: 0,
      totalRevenue: 0,
      totalProfit: 0,
      todayOrders: 0,
      todayRevenue: 0,
      todayProfit: 0,
      monthOrders: 0,
      monthRevenue: 0,
      monthProfit: 0,
      productSales: {}
    });
  }, [orders, products]);

  const topProducts = useMemo(() => {
    return Object.entries(stats.productSales)
      .map(([productId, data]) => ({
        productId,
        ...data,
        name: products.find(p => p.id === productId)?.name || '未知商品'
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [stats.productSales, products]);

  return (
    <div className="statistics">
      <div className="stats-grid">
        <div className="stats-card today">
          <h3>今日数据</h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="label">订单数</span>
              <span className="value">{stats.todayOrders}</span>
            </div>
            <div className="stat-item">
              <span className="label">营业额</span>
              <span className="value">¥{stats.todayRevenue.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="label">利润</span>
              <span className="value">¥{stats.todayProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="stats-card month">
          <h3>本月数据</h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="label">订单数</span>
              <span className="value">{stats.monthOrders}</span>
            </div>
            <div className="stat-item">
              <span className="label">营业额</span>
              <span className="value">¥{stats.monthRevenue.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="label">利润</span>
              <span className="value">¥{stats.monthProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="stats-card total">
          <h3>总计数据</h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="label">总订单数</span>
              <span className="value">{stats.totalOrders}</span>
            </div>
            <div className="stat-item">
              <span className="label">总营业额</span>
              <span className="value">¥{stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="label">总利润</span>
              <span className="value">¥{stats.totalProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="top-products">
        <h3>商品销售排行</h3>
        <table>
          <thead>
            <tr>
              <th>商品名称</th>
              <th>销量</th>
              <th>营业额</th>
              <th>利润</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map(product => (
              <tr key={product.productId}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>¥{product.revenue.toFixed(2)}</td>
                <td>¥{product.profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 