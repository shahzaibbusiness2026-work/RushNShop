export function exportToGoogleSheetsCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  
  // Create UTF-8 BOM so Excel and Google Sheets properly recognize accents and symbols
  const BOM = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row =>
      headers.map(header => {
        let val = row[header] === null || row[header] === undefined ? '' : row[header];
        if (typeof val === 'number') {
          return val;
        }
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-GoogleSheets.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyForGoogleSheets(rows: Record<string, any>[]): boolean {
  if (!rows || !rows.length) return false;
  const headers = Object.keys(rows[0]);
  const tsvContent = [
    headers.join('\t'),
    ...rows.map(row => 
      headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        return String(val).replace(/\t/g, ' ').replace(/\n/g, ' ');
      }).join('\t')
    )
  ].join('\n');

  try {
    navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
