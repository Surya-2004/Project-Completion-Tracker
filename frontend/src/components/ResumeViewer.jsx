import { useState } from 'react';
import { FileText, Download, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ResumeViewer({ resumeUrl, studentName }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert Google Drive PDF URL to embeddable format
  const getEmbeddableUrl = (url) => {
    if (!url) return null;
    
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = '';
      
      // Format: https://drive.google.com/file/d/FILE_ID/view
      const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      }
      
      // Format: https://drive.google.com/open?id=FILE_ID
      const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (openMatch) {
        fileId = openMatch[1];
      }
      
      // Format: https://docs.google.com/document/d/FILE_ID/edit
      const docsMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (docsMatch) {
        fileId = docsMatch[1];
      }
      
      if (fileId) {
        // For PDFs, use the preview URL
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // For non-Google Drive URLs, return as is
    return url;
  };

  const handleDownloadResume = () => {
    if (!resumeUrl) {
      setError('No resume URL provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create a temporary link to download the resume
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${studentName}_Resume.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsLoading(false);
  };

  const embeddableUrl = getEmbeddableUrl(resumeUrl);

  if (!resumeUrl) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">No resume uploaded</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Resume
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Collapse
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Expand
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadResume}
              disabled={isLoading}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {resumeUrl.includes('drive.google.com') ? 'Google Drive' : 'PDF'}
          </Badge>
          <span className="text-sm text-muted-foreground truncate">
            {resumeUrl.split('/').pop() || 'Resume'}
          </span>
        </div>
        
        {/* PDF Viewer */}
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'h-[600px]' : 'h-[400px]'
        }`}>
          <iframe
            src={embeddableUrl}
            className="w-full h-full border rounded-lg"
            title={`${studentName}'s Resume`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load resume');
              setIsLoading(false);
            }}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 