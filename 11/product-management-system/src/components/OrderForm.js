import React, { useState } from 'react';

export const OrderForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    specs: '',
    quantity: 1,
    price: '',
    shippingFee: 0,
    profit: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      shippingFee: Number(formData.shippingFee),
      profit: Number(formData.profit)
    });
    // 重置表单
    setFormData({
      date: new Date().toISOString().split('T')[0],
      specs: '',
      quantity: 1,
      price: '',
      shippingFee: 0,
      profit: 0
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

      <div className="form-group">
        <label>规格：</label>
        <input
          type="text"
          value={formData.specs}
          onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>数量：</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>售价：</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          min="0"
          step="0.01"
          required
        />
      </div>

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