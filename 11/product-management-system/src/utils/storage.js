const PRODUCTS_KEY = 'products';
const ORDERS_KEY = 'orders';

export const storage = {
  // 商品相关
  getProducts: () => {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
  },
  
  saveProducts: (products) => {
    localStorage.setItem('products', JSON.stringify(products));
    // 触发一个自定义事件来通知其他组件
    window.dispatchEvent(new Event('productsUpdated'));
  },

  // 订单相关
  getOrders: () => {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  },
  
  saveOrders: (orders) => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
}; 