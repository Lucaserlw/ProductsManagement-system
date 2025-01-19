import React, { useState, useEffect } from 'react';

export const OrderForm = ({ products, onSubmit }) => {
  const [orderItems, setOrderItems] = useState([{
    productId: '',
    quantity: 1,
    sellingPrice: '',
    isRemoteArea: false,
    suggestedPrice: 0,
    profit: 0
  }]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: orderItems,
      totalAmount: calculateTotalAmount(),
      totalProfit: calculateTotalProfit()
    };
    onSubmit(order);
    setOrderItems([{
      productId: '',
      quantity: 1,
      sellingPrice: '',
      isRemoteArea: false,
      suggestedPrice: 0,
      profit: 0
    }]);
  };

  const calculateTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (Number(item.sellingPrice) * item.quantity), 0);
  };

  const calculateTotalProfit = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      const shippingFee = item.isRemoteArea ? product.shippingFeeRemote : product.shippingFeeNormal;
      return total + ((item.sellingPrice - product.cost - shippingFee) * item.quantity);
    }, 0);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      productId: '',
      quantity: 1,
      sellingPrice: '',
      isRemoteArea: false,
      suggestedPrice: 0,
      profit: 0
    }]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...orderItems];
    const currentItem = newItems[index];
    
    currentItem.productId = productId;
    if (product) {
      const suggestedPrice = product.cost + product.shippingFeeNormal + (product.cost * 0.3);
      currentItem.suggestedPrice = Math.ceil(suggestedPrice);
      currentItem.sellingPrice = currentItem.sellingPrice || currentItem.suggestedPrice;
      
      const shippingFee = currentItem.isRemoteArea ? product.shippingFeeRemote : product.shippingFeeNormal;
      currentItem.profit = (currentItem.sellingPrice - product.cost - shippingFee) * currentItem.quantity;
    }
    
    setOrderItems(newItems);
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'sellingPrice' || field === 'isRemoteArea') {
      const item = newItems[index];
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const shippingFee = item.isRemoteArea ? product.shippingFeeRemote : product.shippingFeeNormal;
        item.profit = (item.sellingPrice - product.cost - shippingFee) * item.quantity;
      }
    }
    
    setOrderItems(newItems);
  };

  return (
    <form onSubmit={handleSubmit} className="order-form">
      {orderItems.map((item, index) => (
        <div key={index} className="order-item">
          <div className="order-item-header">
            <h4>商品 {index + 1}</h4>
            {orderItems.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeOrderItem(index)}
                className="remove-item"
              >
                删除
              </button>
            )}
          </div>

          <div className="order-item-content">
            <div className="form-group">
              <label>商品：</label>
              <select
                value={item.productId}
                onChange={(e) => handleProductChange(index, e.target.value)}
                required
              >
                <option value="">选择商品</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (成本: ¥{product.cost})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>数量：</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateOrderItem(index, 'quantity', Number(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>售价：</label>
                <div className="price-input-group">
                  <input
                    type="number"
                    value={item.sellingPrice}
                    onChange={(e) => updateOrderItem(index, 'sellingPrice', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                  {item.suggestedPrice > 0 && (
                    <span className="suggested-price">
                      建议: ¥{item.suggestedPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={item.isRemoteArea}
                    onChange={(e) => updateOrderItem(index, 'isRemoteArea', e.target.checked)}
                  />
                  偏远地区
                </label>
              </div>
            </div>

            {item.productId && (
              <div className="item-summary">
                <span className="profit-info">
                  预计利润: ¥{item.profit.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="form-actions">
        <button type="button" onClick={addOrderItem} className="add-item-btn">
          + 添加商品
        </button>
        <button type="submit" className="submit-btn">提交订单</button>
      </div>

      <div className="order-summary">
        <div className="summary-row">
          <span>订单总金额：</span>
          <span className="amount">¥{calculateTotalAmount().toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>预计总利润：</span>
          <span className="profit">¥{calculateTotalProfit().toFixed(2)}</span>
        </div>
      </div>
    </form>
  );
}; 