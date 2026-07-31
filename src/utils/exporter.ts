import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

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
