import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import * as fflate from 'fflate';


/**
 * Standard BOS Excel Export with Header Metadata and Styling
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file
 * @param {Object} headerInfo - Optional metadata { userName: string }
 */
export const exportToExcel = (data, fileName, headerInfo = {}) => {
  const sheetName = 'BOS Report';
  const timestamp = new Date().toLocaleString('en-GB', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });

  // Helper to format values specifically for Excel cell display (User ID for Created User, etc.)
  const formatCellValue = (key, val) => {
    if (val === undefined || val === null) return '-';
    
    const keyLower = String(key).toLowerCase();
    const isUserField = keyLower.includes('user') || keyLower.includes('by');
    
    if (isUserField) {
      if (typeof val === 'object' && val !== null) {
        return val.username || val.userId || val.empCode || val.empId || val.id || '-';
      }
      return String(val);
    }
    
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    
    return val;
  };

  const formattedData = (data || []).map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      newRow[key] = formatCellValue(key, row[key]);
    });
    return newRow;
  });

  // 1. Create a worksheet from the JSON data
  const worksheet = XLSX.utils.json_to_sheet([]);

  // 2. Define Styles
  const headerStyle = {
    fill: { fgColor: { rgb: "FFCC99" } }, // Light Orange
    font: { bold: true, name: "Calibri", sz: 12 },
    alignment: { vertical: "center", horizontal: "left" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };

  const titleStyle = {
    font: { bold: true, name: "Calibri", sz: 14, color: { rgb: "000080" } },
    alignment: { horizontal: "left" }
  };

  const metaStyle = {
    font: { italic: true, name: "Calibri", sz: 11, color: { rgb: "666666" } },
    alignment: { horizontal: "left" }
  };

  // 3. Add the main data starting from the top row (A1)
  XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: 'A1', skipHeader: false });

  // 4. Apply Styles (Advanced Enhancement)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[address]) continue;

      // Base style for all data cells
      const baseStyle = {
        font: { name: "Calibri", sz: 11 },
        border: {
          top: { style: "thin", color: { rgb: "E2E2E2" } },
          bottom: { style: "thin", color: { rgb: "E2E2E2" } },
          left: { style: "thin", color: { rgb: "E2E2E2" } },
          right: { style: "thin", color: { rgb: "E2E2E2" } }
        },
        alignment: { vertical: "center", horizontal: "left", wrapText: true }
      };

      if (R === 0) {
        // Table Headers (Row 1)
        worksheet[address].s = headerStyle;
      } else if (R > 0) {
        // Data Rows - Zebra Striping
        if (R % 2 === 0) {
          baseStyle.fill = { fgColor: { rgb: "F9F9F9" } };
        }
        worksheet[address].s = baseStyle;
      }
    }
  }

  // 5. Freeze Top 1 Row (Header Row)
  worksheet['!views'] = [{ state: 'frozen', ySplit: 1 }];

  // 7. Auto-calculate column widths (Aggressive padding)
  const colWidths = Object.keys(formattedData[0] || {}).map(key => {
    const headerLen = key.length;
    const maxDataLen = formattedData.reduce((max, row) => {
      const val = row[key] ? String(row[key]).length : 0;
      return Math.max(max, val);
    }, 0);
    const finalWidth = Math.max(headerLen, maxDataLen, 12) + 6;
    return { wch: finalWidth };
  });

  if (colWidths[0]) {
    colWidths[0].wch = Math.max(colWidths[0].wch, 42);
  }

  worksheet['!cols'] = colWidths;

  // 8. Finalize, patch ZIP with <headerFooter>, and Save
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  let finalBuffer = excelBuffer;
  try {
    const zip = fflate.unzipSync(new Uint8Array(excelBuffer));
    let patched = false;
    Object.keys(zip).forEach(path => {
      if (path.startsWith('xl/worksheets/sheet') && path.endsWith('.xml')) {
        let xml = fflate.strFromU8(zip[path]);
        if (!xml.includes('<headerFooter>')) {
          const headerFooterXml = '<headerFooter><oddFooter>&amp;C&amp;P/&amp;N</oddFooter><evenFooter>&amp;C&amp;P/&amp;N</evenFooter><firstFooter>&amp;C&amp;P/&amp;N</firstFooter></headerFooter>';
          xml = xml.replace('</worksheet>', `${headerFooterXml}</worksheet>`);
          zip[path] = fflate.strToU8(xml);
          patched = true;
        }
      }
    });
    if (patched) {
      finalBuffer = fflate.zipSync(zip);
    }
  } catch (err) {
    console.error('Failed to patch Excel zip headerFooter:', err);
  }

  const dataBlob = new Blob([finalBuffer], { type: 'application/octet-stream' });
  saveAs(dataBlob, `${fileName}.xlsx`);
};
