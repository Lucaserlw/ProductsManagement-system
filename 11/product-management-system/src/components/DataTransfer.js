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
          
          // 修改这里：设置 defval 为空字符串，raw 为 true
          const data = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: true
          });

          onImport(data);
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

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // 设置列宽
    const colWidths = [
      { wch: 12 },  // 日期
      { wch: 20 },  // 规格
      { wch: 8 },   // 数量
      { wch: 10 },  // 售价
      { wch: 8 },   // 邮费
      { wch: 10 }   // 利润
    ];
    ws['!cols'] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, type === 'orders' ? '订单列表' : '商品列表');

    // 生成Excel文件
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // 下载文件
    saveAs(blob, `${type === 'orders' ? '订单列表' : '商品列表'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="data-transfer">
      <div className="import-export-buttons">
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
    </div>
  );
}; 