import React, { useState } from 'react';

export const ProductForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    cost: '',
    promotionFee: '',
    description: '',
    inventory: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>规格：</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>成本价：</label>
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          step="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label>推广费：</label>
        <input
          type="number"
          name="promotionFee"
          value={formData.promotionFee}
          onChange={handleChange}
          step="0.01"
          required
        />
      </div>
      <div className="form-group">
        <label>描述：</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>库存：</label>
        <input
          type="number"
          name="inventory"
          value={formData.inventory}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">保存</button>
    </form>
  );
}; 