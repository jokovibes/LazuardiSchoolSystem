import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export function exportToExcel(sheetName: string, headers: string[], rows: (string | number)[][], filename: string) {
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPdf(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const doc = new jsPDF({
    orientation: rows.length > 0 && headers.length > 5 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header banner
  doc.setFillColor(30, 58, 138); // Primary Navy Blue
  doc.rect(0, 0, doc.internal.pageSize.width, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAZUARDI GLOBAL COMPASSIONATE SCHOOL', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sistem Presensi & Monitoring Pergerakan Siswa | ${title}`, 14, 18);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 32);

  let currentY = 40;
  const colWidth = (doc.internal.pageSize.width - 28) / headers.length;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, doc.internal.pageSize.width - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  headers.forEach((h, i) => {
    doc.text(String(h), 16 + i * colWidth, currentY + 5);
  });

  currentY += 10;
  doc.setFont('helvetica', 'normal');

  rows.forEach((row, rowIndex) => {
    if (currentY > doc.internal.pageSize.height - 20) {
      doc.addPage();
      currentY = 20;
    }

    if (rowIndex % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY - 3, doc.internal.pageSize.width - 28, 7, 'F');
    }

    row.forEach((cell, i) => {
      const text = String(cell ?? '');
      doc.text(text.length > 25 ? text.substring(0, 22) + '...' : text, 16 + i * colWidth, currentY + 2);
    });

    currentY += 7;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Halaman ${i} dari ${pageCount} - Lazuardi Student Attendance System`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`${filename}.pdf`);
}

export async function exportDashboardWithChartsToPdf(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  chartElements: (HTMLElement | null)[],
  filename: string,
  subtitleInfo?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header banner
  doc.setFillColor(30, 58, 138); // Primary Navy Blue
  doc.rect(0, 0, pageWidth, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('LAZUARDI GLOBAL COMPASSIONATE SCHOOL', margin, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sistem Presensi & Monitoring Pergerakan Siswa | ${title}`, margin, 17);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const printDateStr = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  const filterStr = subtitleInfo ? ` | Filter: ${subtitleInfo}` : '';
  doc.text(`${printDateStr}${filterStr}`, margin, 30);

  let currentY = 36;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const colWidth = contentWidth / headers.length;
  headers.forEach((h, i) => {
    doc.text(String(h), margin + 2 + i * colWidth, currentY + 4.5);
  });

  currentY += 8;
  doc.setFont('helvetica', 'normal');

  rows.forEach((row, rowIndex) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }

    if (rowIndex % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY - 3, contentWidth, 6, 'F');
    }

    row.forEach((cell, i) => {
      const text = String(cell ?? '');
      doc.text(text.length > 35 ? text.substring(0, 32) + '...' : text, margin + 2 + i * colWidth, currentY + 1.5);
    });

    currentY += 6;
  });

  currentY += 6;

  // Add Charts Section Header & Images
  const validElements = chartElements.filter((el): el is HTMLElement => el !== null);

  if (validElements.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text('GRAFIK & ANALITIK VISUAL PRESENSI', margin, currentY);
    
    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    
    currentY += 8;

    for (const el of validElements) {
      try {
        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          onclone: (clonedDoc) => {
            try {
              const dummyCanvas = clonedDoc.createElement('canvas');
              const ctx = dummyCanvas.getContext('2d');

              const convertOklchToRgb = (str: string): string => {
                if (!str || typeof str !== 'string' || !str.toLowerCase().includes('oklch')) {
                  return str;
                }
                return str.replace(/oklch\([^)]+\)/gi, (match) => {
                  if (ctx) {
                    try {
                      ctx.fillStyle = '#000000';
                      ctx.fillStyle = match;
                      if (ctx.fillStyle && !ctx.fillStyle.toLowerCase().includes('oklch') && ctx.fillStyle !== '#000000') {
                        return ctx.fillStyle;
                      }
                    } catch {
                      // fallback
                    }
                  }
                  return '#3b82f6';
                });
              };

              // 1. Re-create all <style> tags to purge oklch from stylesheet rules
              const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
              styleTags.forEach(style => {
                if (style.textContent && style.textContent.toLowerCase().includes('oklch')) {
                  const cleanedCss = convertOklchToRgb(style.textContent);
                  const newStyle = clonedDoc.createElement('style');
                  newStyle.textContent = cleanedCss;
                  if (style.parentNode) {
                    style.parentNode.replaceChild(newStyle, style);
                  }
                }
              });

              // 2. Scan all elements in clonedDoc, replace style attributes & computed color properties
              const colorProps = [
                'color',
                'background-color',
                'border-color',
                'border-top-color',
                'border-right-color',
                'border-bottom-color',
                'border-left-color',
                'fill',
                'stroke',
                'outline-color',
                'stop-color',
                'flood-color',
                'lighting-color'
              ];

              const allElements = clonedDoc.querySelectorAll<HTMLElement | SVGElement>('*');
              const view = clonedDoc.defaultView;

              allElements.forEach(el => {
                ['fill', 'stroke', 'color', 'style'].forEach(attr => {
                  const val = el.getAttribute(attr);
                  if (val && val.toLowerCase().includes('oklch')) {
                    el.setAttribute(attr, convertOklchToRgb(val));
                  }
                });

                if (view) {
                  try {
                    const computed = view.getComputedStyle(el);
                    colorProps.forEach(prop => {
                      const val = computed.getPropertyValue(prop);
                      if (val && val.toLowerCase().includes('oklch')) {
                        const rgbVal = convertOklchToRgb(val);
                        if (el.style && typeof el.style.setProperty === 'function') {
                          el.style.setProperty(prop, rgbVal, 'important');
                        }
                      }
                    });
                  } catch {
                    // ignore
                  }
                }
              });
            } catch (e) {
              console.warn('Oklch sanitization warning:', e);
            }
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if page overflow (keep chart on current page or start new page)
        if (currentY + imgHeight > pageHeight - 15) {
          doc.addPage();
          currentY = 20;
        }

        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 6;
      } catch (err) {
        console.error('Error rendering chart to PDF canvas:', err);
      }
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Halaman ${i} dari ${pageCount} - Lazuardi Student Attendance System`, margin, pageHeight - 8);
  }

  doc.save(`${filename}.pdf`);
}

export function buildWhatsAppShareUrl(title: string, summaryText: string, targetPhone?: string): string {
  const message = `*REKAP LAPORAN SCHOOL ATTENDANCE SYSTEM*\n*${title}*\n\n${summaryText}\n\n_Dikirim otomatis dari Sistem Presensi Lazuardi_`;
  const encoded = encodeURIComponent(message);
  if (targetPhone) {
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function shareRekapToUnit(unitName: string, moduleTitle: string, recordsCount: number, summaryLines: string[]) {
  const text = [
    `📊 *REKAP PRESENSI & PERGERAKAN UNIT ${unitName.toUpperCase()}*`,
    `📌 Modul: ${moduleTitle}`,
    `📅 Hari/Tgl: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`,
    `🔢 Total Catatan: ${recordsCount} Siswa`,
    '----------------------------------------',
    ...summaryLines,
    '----------------------------------------',
    'Sistem Manajemen Sekolah Lazuardi'
  ].join('\n');

  if (navigator.share) {
    navigator.share({
      title: `Rekap ${moduleTitle} - ${unitName}`,
      text: text,
    }).catch(() => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }
}
