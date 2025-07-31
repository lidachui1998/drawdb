export const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
};

export const getTableHeight = (table) => {
  const headerHeight = 50;
  const fieldHeight = 36;
  const colorStripHeight = 7;
  
  return headerHeight + (table.fields?.length || 0) * fieldHeight + colorStripHeight;
};

export const strHasQuotes = (str) => {
  if (!str || typeof str !== 'string') return false;
  return (str.startsWith('"') && str.endsWith('"')) || 
         (str.startsWith("'") && str.endsWith("'"));
};

export const isFunction = (obj) => {
  return typeof obj === 'function';
};

export const isKeyword = (word) => {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
    'ALTER', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'PRIMARY', 'KEY',
    'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'NOT', 'NULL', 'UNIQUE', 'DEFAULT',
    'AUTO_INCREMENT', 'IDENTITY', 'SERIAL', 'BIGSERIAL', 'SMALLSERIAL'
  ];
  return keywords.includes(word.toUpperCase());
};

export const areFieldsCompatible = (database, startType, endType) => {
  // 简化的字段兼容性检查
  // 在实际项目中，这个函数会根据数据库类型检查字段类型的兼容性
  
  if (!startType || !endType) return false;
  
  // 相同类型总是兼容的
  if (startType === endType) return true;
  
  // 数字类型之间的兼容性
  const numericTypes = ['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL'];
  const isStartNumeric = numericTypes.some(type => startType.toUpperCase().includes(type));
  const isEndNumeric = numericTypes.some(type => endType.toUpperCase().includes(type));
  
  if (isStartNumeric && isEndNumeric) return true;
  
  // 字符串类型之间的兼容性
  const stringTypes = ['VARCHAR', 'CHAR', 'TEXT', 'STRING', 'NVARCHAR', 'NCHAR'];
  const isStartString = stringTypes.some(type => startType.toUpperCase().includes(type));
  const isEndString = stringTypes.some(type => endType.toUpperCase().includes(type));
  
  if (isStartString && isEndString) return true;
  
  // 日期时间类型之间的兼容性
  const dateTypes = ['DATE', 'TIME', 'DATETIME', 'TIMESTAMP'];
  const isStartDate = dateTypes.some(type => startType.toUpperCase().includes(type));
  const isEndDate = dateTypes.some(type => endType.toUpperCase().includes(type));
  
  if (isStartDate && isEndDate) return true;
  
  // 默认情况下不兼容
  return false;
};

export const arrayIsEqual = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
      if (!arrayIsEqual(arr1[i], arr2[i])) return false;
    } else if (typeof arr1[i] === 'object' && typeof arr2[i] === 'object') {
      if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  
  return true;
};