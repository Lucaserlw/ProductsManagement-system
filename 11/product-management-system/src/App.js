import React from 'react';
import { ProductList } from './components/ProductList';
import { OrderList } from './components/OrderList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>商品管理记账系统</h1>
      </header>
      <main>
        <ProductList />
        <OrderList />
      </main>
    </div>
  );
}

export default App;
