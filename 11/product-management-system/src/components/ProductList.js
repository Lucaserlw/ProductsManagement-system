import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { ProductForm } from './ProductForm';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  const handleAddProduct = (product) => {
    const newProducts = [...products, { ...product, id: Date.now().toString() }];
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

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h2>商品管理</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
          }}
          className="add-product-btn"
        >
          {showForm ? '取消' : '+ 添加商品'}
        </button>
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
                <th>商品名称</th>
                <th>成本价</th>
                <th>普通邮费</th>
                <th>偏远邮费</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>¥{product.cost}</td>
                  <td>¥{product.shippingFeeNormal}</td>
                  <td>¥{product.shippingFeeRemote}</td>
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