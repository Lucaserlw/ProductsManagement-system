import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';
import { OrderForm } from './OrderForm';
import { Statistics } from './Statistics';
import { DataTransfer } from './DataTransfer';
import { Dashboard } from './Dashboard';

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

  useEffect(() => {
    setOrders(storage.getOrders() || []);
    setProducts(storage.getProducts() || []);
    
    // 监听商品数据更新
    const handleProductsUpdate = () => {
      setProducts(storage.getProducts() || []);
    };
    window.addEventListener('productsUpdated', handleProductsUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
  }, []);

  const handleAddOrder = (order) => {
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      date: new Date(order.date).toISOString()
    };
    const newOrders = [...orders, newOrder];
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

    // 应用排序 - 默认按日期降序（最新的在前面）
    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === 'date' || !sortConfig.key) {
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

  const handleImportOrders = (data) => {
    // 处理导入的订单数据
    const processedData = data.map(row => {
      // 如果是已经格式化好的订单对象，直接使用
      if (row.items && Array.isArray(row.items)) {
        return {
          id: String(Date.now() + Math.random()),
          date: row.date || new Date().toISOString(),
          items: row.items,
          totalAmount: row.totalAmount || 0,
          shippingFee: row.shippingFee || 0,
          totalProfit: row.totalProfit || 0,
          isImported: true
        };
      }

      // 否则，处理Excel导入的原始数据
      if (!row['规格']) {
        console.warn('跳过无效数据行:', row);
        return null;
      }

      // 处理日期格式
      let orderDate;
      try {
        orderDate = row['日期'] ? new Date(row['日期']) : new Date();
        if (isNaN(orderDate.getTime())) {
          orderDate = new Date();
        }
      } catch {
        orderDate = new Date();
      }

      return {
        id: String(Date.now() + Math.random()),
        date: orderDate.toISOString(),
        items: [{
          specs: String(row['规格'] || '').trim(),
          quantity: Number(row['数量']) || 1,
          sellingPrice: Number(row['售价']) || 0,
          isRemoteArea: false
        }],
        totalAmount: Number(row['售价']) * (Number(row['数量']) || 1),
        shippingFee: Number(row['邮费']) || 0,
        totalProfit: Number(row['利润']) || 0,
        isImported: true
      };
    }).filter(Boolean);

    if (processedData.length === 0) {
      alert('没有有效的数据可导入！');
      return;
    }

    // 使用函数式更新确保状态更新的准确性
    setOrders(prevOrders => {
      const newOrders = [...prevOrders, ...processedData];
      storage.saveOrders(newOrders);
      return newOrders;
    });

    // 提示导入成功
    alert(`成功导入 ${processedData.length} 条订单数据`);
  };

  const handleExportOrders = () => {
    return orders;
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有订单数据吗？这个操作不可恢复！')) {
      // 清空状态
      setOrders([]);
      setCurrentPage(1);
      setTotalItems(0);
      
      // 使用 storage 工具类清空数据
      storage.clearOrders();
      
      // 提示用户
      alert('订单数据已清空');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('确定要删除这个订单吗？')) {
      const newOrders = orders.filter(order => order.id !== orderId);
      setOrders(newOrders);
      storage.saveOrders(newOrders);
    }
  };

  const renderOrderRow = (order) => {
    if (order.isImported) {
      // 渲染导入的订单数据
      return (
        <tr key={order.id}>
          <td>{new Date(order.date).toLocaleDateString('zh-CN')}</td>
          <td>{order.items[0]?.specs || ''}</td>
          <td>{order.items[0]?.quantity || 0}</td>
          <td>¥{(order.totalAmount || 0).toFixed(2)}</td>
          <td>¥{(order.shippingFee || 0).toFixed(2)}</td>
          <td>¥{(order.totalProfit || 0).toFixed(2)}</td>
          <td>
            <button 
              onClick={() => handleDeleteOrder(order.id)}
              className="delete-btn"
            >
              删除
            </button>
          </td>
        </tr>
      );
    } else {
      // 渲染手动添加的订单数据
      const totalQuantity = order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
      
      return (
        <tr key={order.id}>
          <td>{new Date(order.date).toLocaleDateString('zh-CN')}</td>
          <td>{order.items?.map(item => item.specs).join(', ') || ''}</td>
          <td>{totalQuantity}</td>
          <td>¥{(order.totalAmount || 0).toFixed(2)}</td>
          <td>¥{(order.shippingFee || 0).toFixed(2)}</td>
          <td>¥{(order.totalProfit || 0).toFixed(2)}</td>
          <td>
            <button 
              onClick={() => handleDeleteOrder(order.id)}
              className="delete-btn"
            >
              删除
            </button>
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="order-list">
      {/* 数据看板 */}
      <Dashboard orders={orders} />
      
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
              <th onClick={() => handleSort('date')}>
                日期 {renderSortIcon('date')}
              </th>
              <th>规格</th>
              <th>数量</th>
              <th onClick={() => handleSort('totalAmount')}>
                总金额 {renderSortIcon('totalAmount')}
              </th>
              <th>邮费</th>
              <th onClick={() => handleSort('totalProfit')}>
                利润 {renderSortIcon('totalProfit')}
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map(renderOrderRow)}
          </tbody>
        </table>

        {/* 分页控制 */}
        <div className="pagination">
          <div className="page-size">
            每页显示：
            <select 
              value={pageSize} 
              onChange={(e) => {
                const newPageSize = Number(e.target.value);
                setPageSize(newPageSize);
                // 调整当前页码，确保数据连续性
                const newMaxPage = Math.ceil(totalItems / newPageSize);
                if (currentPage > newMaxPage) {
                  setCurrentPage(newMaxPage);
                }
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