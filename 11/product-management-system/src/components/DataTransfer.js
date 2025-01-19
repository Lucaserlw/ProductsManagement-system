import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const DataTransfer = ({ onImport, onExport, type }) => {
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: true,
          });

          if (type === 'orders') {
            // 处理订单数据
            const processedData = rawData.map(row => ({
              id: String(Date.now() + Math.random()),
              date: row['日期'] ? new Date(row['日期']).toISOString() : new Date().toISOString(),
              items: [{
                specs: row['规格'] || '',
                quantity: Number(row['数量']) || 0,
                sellingPrice: Number(row['售价']) || 0,
                isRemoteArea: false,
                productId: row['规格'] || ''
              }],
              totalAmount: Number(row['售价']) || 0,
              totalProfit: Number(row['利润']) || 0,
              shippingFee: Number(row['邮费']) || 0
            }));
            onImport(processedData);
          } else {
            // 处理商品数据
            const processedData = rawData.map(row => ({
              id: String(Date.now() + Math.random()),
              date: row['日期'] || new Date().toISOString(),
              name: row['规格'] || '',
              cost: Number(row['成本价']) || 0,
              promotionFee: Number(row['推广费']) || 0,
              description: row['描述'] || '',
              inventory: Number(row['库存']) || 0
            }));
            onImport(processedData);
          }
        } catch (error) {
          alert('导入失败：文件格式不正确');
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    const data = onExport();
    if (!data || data.length === 0) {
      alert('没有数据可导出');
      return;
    }

    let exportData;
    let fileName;
    let sheetName;
    let colWidths;

    if (type === 'orders') {
      // 导出订单数据
      exportData = data.map(order => ({
        '日期': new Date(order.date).toLocaleDateString('zh-CN'),
        '规格': order.items[0]?.specs || '',
        '数量': order.items[0]?.quantity || 0,
        '售价': order.items[0]?.sellingPrice || 0,
        '邮费': order.shippingFee || 0,
        '利润': order.totalProfit || 0
      }));
      fileName = '订单列表';
      sheetName = '订单列表';
      colWidths = [
        { wch: 12 },  // 日期
        { wch: 30 },  // 规格
        { wch: 8 },   // 数量
        { wch: 10 },  // 售价
        { wch: 8 },   // 邮费
        { wch: 10 }   // 利润
      ];
    } else {
      // 导出商品数据
      exportData = data.map(product => ({
        '日期': new Date(product.date).toLocaleDateString('zh-CN'),
        '规格': product.name,
        '成本价': product.cost,
        '推广费': product.promotionFee,
        '描述': product.description,
        '库存': product.inventory
      }));
      fileName = '商品列表';
      sheetName = '商品列表';
      colWidths = [
        { wch: 12 },  // 日期
        { wch: 30 },  // 规格
        { wch: 10 },  // 成本价
        { wch: 10 },  // 推广费
        { wch: 20 },  // 描述
        { wch: 8 }    // 库存
      ];
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 生成Excel文件
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // 下载文件
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="data-transfer">
      <div className="import-wrapper">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          id={`import-${type}`}
          className="file-input"
        />
        <label htmlFor={`import-${type}`} className="import-btn">
          导入{type === 'orders' ? '订单' : '商品'}表
        </label>
      </div>
      <button onClick={handleExport} className="export-btn">
        导出{type === 'orders' ? '订单' : '商品'}表
      </button>
    </div>
  );
}; 