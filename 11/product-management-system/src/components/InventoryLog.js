import React from 'react';

export const InventoryLog = ({ logs }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="inventory-log">
      <h3>库存变动记录</h3>
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>规格</th>
            <th>变动数量</th>
            <th>变动类型</th>
            <th>当前库存</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className={log.type === 'reduce' ? 'reduce' : 'add'}>
              <td>{formatDate(log.date)}</td>
              <td>{log.specs}</td>
              <td>{log.type === 'reduce' ? '-' : '+'}{log.amount}</td>
              <td>{log.type === 'reduce' ? '出库' : '入库'}</td>
              <td>{log.currentInventory}</td>
              <td>{log.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 