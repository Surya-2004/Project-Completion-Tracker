import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PDFGenerator from '../services/pdfGenerator';
import api from '../services/api';

export default function DownloadPDFButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch all required data
      const [statsResponse, teamsResponse, studentsResponse] = await Promise.all([
        api.get('/statistics'),
        api.get('/teams'),
        api.get('/students')
      ]);

      const stats = statsResponse.data;
      const teams = teamsResponse.data;
      const students = studentsResponse.data;

      // Generate PDF
      const pdfGenerator = new PDFGenerator();
      await pdfGenerator.generatePDF(stats, teams, students);

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