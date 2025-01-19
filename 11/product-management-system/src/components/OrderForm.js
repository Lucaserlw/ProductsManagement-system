import React, { useState } from 'react';

export const OrderForm = ({ products, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        specs: '',
        quantity: 1,
        sellingPrice: '',
        isRemoteArea: false
      }
    ],
    shippingFee: 0,
    profit: 0
  });

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        specs: '',
        quantity: 1,
        sellingPrice: '',
        isRemoteArea: false
      }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 计算每个商品的利润和总金额
    const processedItems = formData.items.map(item => {
      const product = products.find(p => p.name === item.specs);
      const itemProfit = product ? 
        (Number(item.sellingPrice) - product.cost) * Number(item.quantity) - 
        (item.isRemoteArea ? product.promotionFee : 0) : 0;

      return {
        ...item,
        quantity: Number(item.quantity),
        sellingPrice: Number(item.sellingPrice),
        profit: itemProfit
      };
    });

    const totalAmount = processedItems.reduce((sum, item) => 
      sum + (item.sellingPrice * item.quantity), 0);
    
    const totalProfit = processedItems.reduce((sum, item) => sum + item.profit, 0);

    onSubmit({
      ...formData,
      items: processedItems,
      totalAmount,
      totalProfit: totalProfit - Number(formData.shippingFee),
      shippingFee: Number(formData.shippingFee),
      isImported: false // 标记为手动添加的订单
    });
  };

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <div className="form-group">
        <label>日期：</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="order-items">
        {formData.items.map((item, index) => (
          <div key={index} className="order-item">
            <h4>商品 {index + 1}</h4>
            <div className="form-group">
              <label>规格：</label>
              <select
                value={item.specs}
                onChange={(e) => handleItemChange(index, 'specs', e.target.value)}
                required
              >
                <option value="">请选择商品</option>
                {products.map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>数量：</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>售价：</label>
              <input
                type="number"
                value={item.sellingPrice}
                onChange={(e) => handleItemChange(index, 'sellingPrice', e.target.value)}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={item.isRemoteArea}
                  onChange={(e) => handleItemChange(index, 'isRemoteArea', e.target.checked)}
                />
                偏远地区
              </label>
            </div>

            {formData.items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="remove-item-btn"
              >
                删除商品
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="add-item-btn"
      >
        添加商品
      </button>

      <div className="form-group">
        <label>邮费：</label>
        <input
          type="number"
          value={formData.shippingFee}
          onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
          min="0"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>利润：</label>
        <input
          type="number"
          value={formData.profit}
          onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
          step="0.01"
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit">提交订单</button>
      </div>
    </form>
  );
};