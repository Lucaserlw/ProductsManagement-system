import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { ProductForm } from './ProductForm';
import { DataTransfer } from './DataTransfer';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setProducts(storage.getProducts() || []);
  }, []);

  const handleAddProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: product.specs || '',  // 使用规格作为名称
      cost: Number(product.cost) || 0,
      promotionFee: Number(product.promotionFee) || 0,
      description: product.description || '',
      inventory: Number(product.inventory) || 0
    };
    const newProducts = [...products, newProduct];
    setProducts(newProducts);
    storage.saveProducts(newProducts);
    setShowForm(false);
  };

  const handleEditProduct = (product) => {
    const newProducts = products.map(p => 
      p.id === product.id ? product : p
    );
    setProducts(newProducts);
    storage.saveProducts(newProducts);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('确定要删除这个商品吗？')) {
      const newProducts = products.filter(p => p.id !== productId);
      setProducts(newProducts);
      storage.saveProducts(newProducts);
    }
  };

  const handleImportProducts = (data) => {
    // 确保所有数值字段都有默认值
    const processedData = data.map(item => ({
      id: item.id || Date.now().toString(),
      date: item.date || new Date().toISOString(),
      name: item.name || '',
      cost: Number(item.cost) || 0,
      promotionFee: Number(item.promotionFee) || 0,
      description: item.description || '',
      inventory: Number(item.inventory) || 0
    }));
    
    setProducts(processedData);
    storage.saveProducts(processedData);
  };

  const handleExportProducts = () => {
    return products;
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有商品数据吗？')) {
      setProducts([]);
      storage.saveProducts([]);
    }
  };

  return (
    <div className="product-list">
      <div className="header-actions">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="add-product-btn"
        >
          {showForm ? '取消' : '+ 新增商品'}
        </button>
        <DataTransfer
          onImport={handleImportProducts}
          onExport={handleExportProducts}
          type="products"
        />
        <button 
          onClick={handleClearData}
          className="clear-data-btn"
        >
          清空数据
        </button>
      </div>

      <div className="product-list-header">
        <h2>商品管理</h2>
      </div>

      {showForm && !editingProduct && (
        <div className="product-form-container">
          <h3>添加新商品</h3>
          <ProductForm onSubmit={handleAddProduct} />
        </div>
      )}

      {editingProduct && (
        <div className="product-form-container">
          <h3>编辑商品</h3>
          <ProductForm 
            onSubmit={handleEditProduct}
            initialData={editingProduct}
          />
          <button 
            onClick={() => setEditingProduct(null)}
            className="cancel-edit-btn"
          >
            取消编辑
          </button>
        </div>
      )}

      {products.length > 0 ? (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>规格</th>
                <th>成本价</th>
                <th>推广费</th>
                <th>描述</th>
                <th>库存</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{new Date(product.date).toLocaleDateString('zh-CN')}</td>
                  <td>{product.name || ''}</td>
                  <td>¥{(product.cost || 0).toFixed(2)}</td>
                  <td>¥{(product.promotionFee || 0).toFixed(2)}</td>
                  <td>{product.description || ''}</td>
                  <td>{product.inventory || 0}</td>
                  <td>
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(false);
                      }}
                      className="edit-btn"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="delete-btn"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>暂无商品数据</p>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="add-product-btn"
            >
              添加第一个商品
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 