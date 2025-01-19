import React, { useState } from 'react';

export const InventoryAdjustForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'add',
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      date: new Date().toISOString(),
      specs: product.specs,
      currentInventory: product.inventory + (formData.type === 'add' ? Number(formData.amount) : -Number(formData.amount))
    });
  };

  return (
    <form onSubmit={handleSubmit} className="inventory-adjust-form">
      <div className="form-group">
        <label>调整类型：</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="add">入库</option>
          <option value="reduce">出库</option>
        </select>
      </div>

      <div className="form-group">
        <label>数量：</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          min="1"
          max={formData.type === 'reduce' ? product.inventory : undefined}
          required
        />
      </div>

      <div className="form-group">
        <label>备注：</label>
        <input
          type="text"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="请输入调整原因"
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit">确认</button>
        <button type="button" onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}; 