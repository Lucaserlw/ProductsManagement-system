import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { OrderForm } from './OrderForm';
import { Statistics } from './Statistics';

export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // 添加一个函数来更新商品列表
  const updateProducts = () => {
    setProducts(storage.getProducts());
  };

  useEffect(() => {
    // 初始加载数据
    setOrders(storage.getOrders());
    updateProducts();

    // 添加事件监听器来监听 localStorage 的变化
    const handleStorageChange = (e) => {
      if (e.key === 'products') {
        updateProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 设置定期检查商品列表更新
    const intervalId = setInterval(updateProducts, 1000);

    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const handleAddOrder = (order) => {
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    storage.saveOrders(newOrders);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : '未知商品';
  };

  return (
    <div className="order-list">
      <h2>订单管理</h2>
      
      <Statistics orders={orders} products={products} />
      
      <div className="order-actions">
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '新增订单'}
        </button>
      </div>

      {showForm && (
        <div className="order-form-container">
          <h3>新增订单</h3>
          <OrderForm products={products} onSubmit={handleAddOrder} />
        </div>
      )}

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>订单时间</th>
              <th>商品明细</th>
              <th>订单金额</th>
              <th>利润</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{formatDate(order.date)}</td>
                <td>
                  <ul className="order-items-list">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {getProductName(item.productId)} × {item.quantity}
                        {item.isRemoteArea && ' (偏远地区)'}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>¥{order.totalAmount}</td>
                <td>¥{order.totalProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 