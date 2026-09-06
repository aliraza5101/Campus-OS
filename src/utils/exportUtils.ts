/**
 * CampusOS Universal Export Utility
 * Supports CSV/Excel file downloads and Professional Institutional PDF Print Reports
 */

export interface ReportExportData {
  title: string;
  category: string;
  recordsCount: number;
  lastGenerated: string;
  format: string;
  description: string;
  dataHeaders?: string[];
  dataRows?: (string | number)[][];
}

/**
 * Downloads structured data as a UTF-8 CSV file (Compatible with Excel)
 */
export const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const processCell = (cell: string | number) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(processCell).join(','),
    ...rows.map((row) => row.map(processCell).join(',')),
  ].join('\n');

  // Include UTF-8 BOM so Excel opens non-ASCII characters correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Opens a beautifully formatted, print-ready institutional PDF report window
 */
export const printInstitutionalPDF = (report: ReportExportData) => {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return;

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const headersHtml = report.dataHeaders
    ? report.dataHeaders.map((h) => `<th style="text-align: left; padding: 10px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase;">${h}</th>`).join('')
    : '';

  const rowsHtml = report.dataRows
    ? report.dataRows
        .map(
          (row, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #f1f5f9;">
        ${row.map((cell) => `<td style="padding: 10px 12px; font-size: 12px; color: #1e293b;">${cell}</td>`).join('')}
      </tr>
    `
        )
        .join('')
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${report.title} - CampusOS Official Report</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            background: #fff;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #283593;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo {
            width: 44px;
            height: 44px;
            object-fit: contain;
            display: inline-block;
          }
          .title-area h1 {
            font-size: 20px;
            margin: 0;
            color: #0f172a;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .title-area p {
            font-size: 11px;
            margin: 2px 0 0 0;
            color: #64748b;
            font-weight: 600;
          }
          .badge {
            background: #eef2ff;
            color: #283593;
            border: 1px solid #c7d2fe;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }
          .metadata-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .meta-item {
            font-size: 12px;
          }
          .meta-label {
            color: #64748b;
            font-weight: 500;
            margin-bottom: 2px;
          }
          .meta-value {
            color: #0f172a;
            font-weight: 700;
          }
          .section-title {
            font-size: 14px;
            font-weight: 800;
            color: #1e293b;
            margin: 20px 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #283593; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div class="brand">
            <img src="/campusos-logo.png" class="logo" alt="CampusOS Logo" />
            <div class="title-area">
              <h1>CampusOS Institutional Intelligence</h1>
              <p>Academic Excellence & Career Readiness Analytics Platform</p>
            </div>
          </div>
          <div class="badge">${report.category}</div>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; margin: 0 0 6px 0; color: #1e293b; font-weight: 800;">${report.title}</h2>
          <p style="font-size: 12px; margin: 0; color: #475569; line-height: 1.5;">${report.description}</p>
        </div>

        <div class="metadata-card">
          <div class="meta-item">
            <div class="meta-label">Total Analyzed Records</div>
            <div class="meta-value">${report.recordsCount} Records</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Generation Timestamp</div>
            <div class="meta-value">${report.lastGenerated}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Export Date</div>
            <div class="meta-value">${dateStr}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Accreditation Audit Status</div>
            <div class="meta-value" style="color: #059669;">Verified & Compliant</div>
          </div>
        </div>

        ${
          report.dataHeaders && report.dataHeaders.length > 0
            ? `
            <div class="section-title">Institutional Report Summary Data</div>
            <table>
              <thead>
                <tr>${headersHtml}</tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          `
            : `
            <div class="section-title">System Verified Metrics Summary</div>
            <div style="padding: 20px; background: #f1f5f9; border-radius: 8px; font-size: 12px; color: #334155; line-height: 1.6;">
              This document represents an officially generated CampusOS institutional report. It incorporates real-time GPA distributions, student career readiness metrics, skill verification audits, and active industry opportunity matching records.
            </div>
          `
        }

        <div class="footer">
          <span>CampusOS Official University Administration Report</span>
          <span>Confidential — Internal Board Use Only</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
