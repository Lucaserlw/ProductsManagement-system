import React, { useState } from 'react';

export const ProductForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    cost: '',
    shippingFeeNormal: '',
    shippingFeeRemote: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      cost: Number(formData.cost),
      shippingFeeNormal: Number(formData.shippingFeeNormal),
      shippingFeeRemote: Number(formData.shippingFeeRemote)
    });
    if (!initialData) {
      setFormData({
        name: '',
        cost: '',
        shippingFeeNormal: '',
        shippingFeeRemote: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label>商品名称：</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>成本价：</label>
        <input
          type="number"
          value={formData.cost}
          onChange={(e) => setFormData({...formData, cost: e.target.value})}
          required
          min="0"
          step="0.01"
        />
      </div>
      <div className="form-group">
        <label>普通邮费：</label>
        <input
          type="number"
          value={formData.shippingFeeNormal}
          onChange={(e) => setFormData({...formData, shippingFeeNormal: e.target.value})}
          required
          min="0"
          step="0.01"
        />
      </div>
      <div className="form-group">
        <label>偏远邮费：</label>
        <input
          type="number"
          value={formData.shippingFeeRemote}
          onChange={(e) => setFormData({...formData, shippingFeeRemote: e.target.value})}
          required
          min="0"
          step="0.01"
        />
      </div>
      <button type="submit">{initialData ? '保存修改' : '添加商品'}</button>
    </form>
  );
}; 