import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';
import { OrderForm } from './OrderForm';
import { Statistics } from './Statistics';
import { DataTransfer } from './DataTransfer';

export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    specs: '',
    minProfit: null,
    maxProfit: null
  });

  // 添加分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // 添加排序相关状态
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

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
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [{
        specs: order.specs,
        quantity: Number(order.quantity),
        sellingPrice: Number(order.price),
        isRemoteArea: false
      }],
      totalAmount: Number(order.price) * Number(order.quantity),
      totalProfit: Number(order.profit),
      shippingFee: Number(order.shippingFee)
    };
    
    const newOrders = [newOrder, ...orders];
    setOrders(newOrders);
    storage.saveOrders(newOrders);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : '未知商品';
  };

  // 筛选订单
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      const dateInRange = (!filters.dateRange.start || orderDate >= new Date(filters.dateRange.start)) &&
                         (!filters.dateRange.end || orderDate <= new Date(filters.dateRange.end));
      
      const specsMatch = !filters.specs || 
                        order.items.some(item => 
                          item.specs.toLowerCase().includes(filters.specs.toLowerCase())
                        );
      
      const profitInRange = (!filters.minProfit || order.totalProfit >= Number(filters.minProfit)) &&
                           (!filters.maxProfit || order.totalProfit <= Number(filters.maxProfit));
      
      return dateInRange && specsMatch && profitInRange;
    });
  }, [orders, filters]);

  // 分页和排序后的订单列表
  const paginatedOrders = useMemo(() => {
    // 首先应用筛选
    const filtered = filteredOrders;
    setTotalItems(filtered.length);

    // 应用排序
    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (sortConfig.key === 'totalAmount' || sortConfig.key === 'totalProfit') {
        return sortConfig.direction === 'asc'
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      }
      return 0;
    });

    // 应用分页
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  }, [filteredOrders, currentPage, pageSize, sortConfig]);

  // 处理排序
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 渲染排序图标
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // 添加处理函数
  const handleImportOrders = (data) => {
    // 处理导入的数据
    const processedData = data.map(order => ({
      id: order.id || Date.now().toString(),
      date: order.date || new Date().toISOString(),
      items: Array.isArray(order.items) ? order.items : [],
      totalAmount: Number(order.totalAmount) || 0,
      totalProfit: Number(order.totalProfit) || 0
    }));

    setOrders(processedData);
    storage.saveOrders(processedData);
  };

  const handleExportOrders = () => {
    return orders;
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有订单数据吗？')) {
      setOrders([]);
      storage.saveOrders([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="order-list">
      <div className="order-list-header">
        <h2>订单管理</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="add-order-btn"
          >
            {showForm ? '取消' : '+ 新增订单'}
          </button>
          <DataTransfer
            onImport={handleImportOrders}
            onExport={handleExportOrders}
            type="orders"
          />
          <button 
            onClick={handleClearData}
            className="clear-data-btn"
          >
            清空数据
          </button>
        </div>
      </div>

      {/* 筛选器部分 */}
      <div className="filters">
        <div className="filter-group">
          <label>日期范围</label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={e => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
          />
          <span>至</span>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={e => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>规格</label>
          <input
            type="text"
            value={filters.specs}
            onChange={e => handleFilterChange('specs', e.target.value)}
            placeholder="输入规格关键字"
          />
        </div>
        <div className="filter-group">
          <label>利润范围</label>
          <input
            type="number"
            value={filters.minProfit}
            onChange={e => handleFilterChange('minProfit', e.target.value)}
            placeholder="最小值"
          />
          <span>至</span>
          <input
            type="number"
            value={filters.maxProfit}
            onChange={e => handleFilterChange('maxProfit', e.target.value)}
            placeholder="最大值"
          />
        </div>
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
              <th onClick={() => handleSort('date')} className="sortable">
                订单时间 {renderSortIcon('date')}
              </th>
              <th>商品明细</th>
              <th onClick={() => handleSort('totalAmount')} className="sortable">
                订单金额 {renderSortIcon('totalAmount')}
              </th>
              <th onClick={() => handleSort('totalProfit')} className="sortable">
                利润 {renderSortIcon('totalProfit')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map(order => (
              <tr key={order.id}>
                <td>{new Date(order.date).toLocaleDateString('zh-CN')}</td>
                <td>
                  <ul className="order-items-list">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.specs} × {item.quantity}
                        {item.isRemoteArea && ' (偏远地区)'}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>¥{order.totalAmount.toFixed(2)}</td>
                <td>¥{order.totalProfit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页控制 */}
        <div className="pagination">
          <div className="page-size">
            每页显示：
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          <div className="page-controls">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              首页
            </button>
            <button 
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <span className="page-info">
              第 {currentPage} 页 / 共 {Math.ceil(totalItems / pageSize)} 页
              （共 {totalItems} 条记录）
            </span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(totalItems / pageSize)}
            >
              下一页
            </button>
            <button 
              onClick={() => setCurrentPage(Math.ceil(totalItems / pageSize))}
              disabled={currentPage >= Math.ceil(totalItems / pageSize)}
            >
              末页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 