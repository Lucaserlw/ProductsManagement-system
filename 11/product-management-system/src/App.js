import React, { useState } from 'react';
import { ProductList } from './components/ProductList';
import { OrderList } from './components/OrderList';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('orders'); // 默认显示订单列表

  return (
    <div className="App">
      <header className="App-header">
        <h1>商品管理记账系统</h1>
      </header>
      <main>
        <nav className="nav-buttons">
          <button 
            onClick={() => setCurrentView('orders')}
            className={currentView === 'orders' ? 'active' : ''}
          >
            订单管理
          </button>
          <button 
            onClick={() => setCurrentView('products')}
            className={currentView === 'products' ? 'active' : ''}
          >
            商品管理
          </button>
        </nav>
        {currentView === 'orders' ? <OrderList /> : <ProductList />}
      </main>
    </div>
  );
}

export default App;
