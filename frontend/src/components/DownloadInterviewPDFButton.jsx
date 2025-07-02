import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PDFGenerator from '../services/pdfGenerator';
import api, { interviewAPI } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to temporarily replace oklch colors
function replaceOklchColors(element, toFallback = true, backup = new Map()) {
  const elements = element.querySelectorAll('*');
  elements.forEach(el => {
    const style = getComputedStyle(el);
    ['backgroundColor', 'color', 'borderColor'].forEach(prop => {
      const val = style[prop];
      if (val && val.includes('oklch')) {
        if (toFallback) {
          // Backup original style
          if (!backup.has(el)) backup.set(el, {});
          backup.get(el)[prop] = el.style[prop];
          // Set fallback
          if (prop === 'backgroundColor') el.style[prop] = '#fff';
          else if (prop === 'color') el.style[prop] = '#23272f';
          else if (prop === 'borderColor') el.style[prop] = '#e5e7eb';
        } else {
          // Restore original
          if (backup.has(el) && backup.get(el)[prop] !== undefined) {
            el.style[prop] = backup.get(el)[prop];
          }
        }
      }
    });
  });
}

export default function DownloadInterviewPDFButton({ dashboardRef }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (dashboardRef && dashboardRef.current) {
        // Workaround: replace oklch colors before html2canvas
        const backup = new Map();
        replaceOklchColors(dashboardRef.current, true, backup);
        const input = dashboardRef.current;
        const canvas = await html2canvas(input, { scale: 2 });
        replaceOklchColors(dashboardRef.current, false, backup); // revert
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = { width: canvas.width, height: canvas.height };
        const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
        const imgWidth = imgProps.width * ratio;
        const imgHeight = imgProps.height * ratio;
        pdf.addImage(imgData, 'PNG', (pdfWidth - imgWidth) / 2, 20, imgWidth, imgHeight);
        pdf.save(`Interview_Statistics_${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        // Fallback: old method
        const [overviewRes, studentsRes, teamsRes, departmentsRes] = await Promise.all([
          interviewAPI.getOverviewStats(),
          api.get('/students'),
          api.get('/teams'),
          api.get('/departments')
        ]);
        const overviewStats = overviewRes.data;
        const students = studentsRes.data;
        const teams = teamsRes.data;
        const departments = departmentsRes.data;
        const pdfGenerator = new PDFGenerator();
        if (pdfGenerator.generateInterviewPDF) {
          await pdfGenerator.generateInterviewPDF(overviewStats, students, teams, departments);
        } else {
          pdfGenerator.addTitle('Interview Statistics Report', 24);
          pdfGenerator.addText(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 10);
          pdfGenerator.currentY += 10;
          pdfGenerator.addSubtitle('Key Metrics', 16);
          pdfGenerator.addSimpleTable(
            ['Metric', 'Value'],
            [
              ['Total Interviews', overviewStats.totalInterviews],
              ['Average Total Score', overviewStats.averageTotalScore],
              ['Average Score', overviewStats.averageAverageScore],
              ['Highest Score', overviewStats.highestScore]
            ],
            pdfGenerator.currentY
          );
          pdfGenerator.currentY += 10;
          pdfGenerator.addSubtitle('Top Performers', 16);
          if (overviewStats.topPerformers && overviewStats.topPerformers.length > 0) {
            pdfGenerator.addSimpleTable(
              ['Rank', 'Name', 'Registered Number', 'Department', 'Team', 'Total Score', 'Average Score'],
              overviewStats.topPerformers.map((p, i) => [
                `#${i + 1}`,
                p.studentId?.name || '',
                p.studentId?.registeredNumber || '',
                p.studentId?.department?.name || '',
                p.teamId?.teamNumber ? `Team ${p.teamId.teamNumber}` : '',
                p.totalScore,
                p.averageScore
              ]),
              pdfGenerator.currentY
            );
          } else {
            pdfGenerator.addText('No top performers data available.', 12);
          }
          pdfGenerator.addFooter && pdfGenerator.addFooter();
          pdfGenerator.doc.save(`Interview_Statistics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        }
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </>
        )}
      </Button>
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm z-10">
          {error}
        </div>
      )}
    </div>
  );
} 