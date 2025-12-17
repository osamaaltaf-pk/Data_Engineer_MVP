import { DataRow, DataProfile, ColumnProfile } from '../types';

export const parseCSV = (text: string): DataRow[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => 
      val.trim().replace(/^"|"$/g, '')
    );
    
    if (values.length === headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        let val: string | number | null = values[index];
        // Basic type inference for parsing
        if (val === '' || val === 'null' || val === 'undefined') {
          val = null;
        } else if (!isNaN(Number(val)) && val !== '') {
          val = Number(val);
        }
        row[header] = val;
      });
      data.push(row);
    }
  }
  return data;
};

export const exportToCSV = (data: DataRow[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  const rows = data.map(row => {
    return headers.map(header => {
      const val = row[header];
      const str = String(val === null || val === undefined ? '' : val);
      return str.includes(',') || str.includes('"') 
        ? `"${str.replace(/"/g, '""')}"` 
        : str;
    }).join(',');
  });
  return [headerRow, ...rows].join('\n');
};

export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

// --- Feature 1: Profiling Logic ---

export const generateDataProfile = (data: DataRow[]): DataProfile => {
  if (data.length === 0) {
    return { totalRows: 0, totalColumns: 0, columns: [], completenessScore: 0 };
  }

  const headers = Object.keys(data[0]);
  const totalRows = data.length;
  let totalMissing = 0;
  let totalCells = totalRows * headers.length;

  const columns: ColumnProfile[] = headers.map(header => {
    const values = data.map(row => row[header]);
    const missingCount = values.filter(v => v === null || v === '' || v === undefined).length;
    const uniqueCount = new Set(values).size;
    
    // Simple type detection based on majority
    const nonNullValues = values.filter(v => v !== null && v !== '');
    const isNumber = nonNullValues.length > 0 && nonNullValues.every(v => typeof v === 'number');
    const type = isNumber ? 'Number' : 'String';

    totalMissing += missingCount;

    return {
      name: header,
      type,
      missingCount,
      uniqueCount,
      example: nonNullValues[0] ?? null
    };
  });

  const completenessScore = Math.round(((totalCells - totalMissing) / totalCells) * 100);

  return {
    totalRows,
    totalColumns: headers.length,
    columns,
    completenessScore
  };
};

// --- Feature 9: Common Fixes (Client-side) ---

export const trimWhitespace = (data: DataRow[]): DataRow[] => {
  return data.map(row => {
    const newRow: DataRow = {};
    for (const [key, val] of Object.entries(row)) {
      newRow[key] = typeof val === 'string' ? val.trim() : val;
    }
    return newRow;
  });
};

export const removeDuplicates = (data: DataRow[]): DataRow[] => {
  const seen = new Set();
  return data.filter(row => {
    const serialized = JSON.stringify(row);
    if (seen.has(serialized)) return false;
    seen.add(serialized);
    return true;
  });
};

export const convertToLowerCase = (data: DataRow[]): DataRow[] => {
    return data.map(row => {
        const newRow: DataRow = {};
        for (const [key, val] of Object.entries(row)) {
            newRow[key] = typeof val === 'string' ? val.toLowerCase() : val;
        }
        return newRow;
    });
};

// --- Feature 8: Bulk Find & Replace ---

export const countMatches = (data: DataRow[], column: string, find: string, matchCase: boolean, useRegex: boolean): number => {
    if (!find) return 0;
    let count = 0;
    try {
        const regexFlags = matchCase ? 'g' : 'gi';
        // If not using regex, escape the search string for regex construction to ensure literal match
        const searchPattern = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(searchPattern, regexFlags);

        data.forEach(row => {
            const keysToCheck = column === '__all__' ? Object.keys(row) : [column];
            keysToCheck.forEach(key => {
                const val = String(row[key] ?? '');
                // Simple check if it matches at all
                if (val.match(regex)) {
                    count++;
                }
            });
        });
    } catch (e) {
        return 0;
    }
    return count;
};

export const applyFindReplace = (data: DataRow[], column: string, find: string, replace: string, matchCase: boolean, useRegex: boolean): DataRow[] => {
     if (!find) return data;
     try {
        const regexFlags = matchCase ? 'g' : 'gi';
        const searchPattern = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(searchPattern, regexFlags);

        return data.map(row => {
            const newRow = { ...row };
            const keysToCheck = column === '__all__' ? Object.keys(row) : [column];
            
            keysToCheck.forEach(key => {
                const val = newRow[key];
                if (val !== null && val !== undefined) {
                    newRow[key] = String(val).replace(regex, replace);
                }
            });
            return newRow;
        });
     } catch (e) {
         console.error("Find/Replace error", e);
         return data;
     }
};
