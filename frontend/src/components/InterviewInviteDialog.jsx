import { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { interviewAPI } from '../services/api';

export default function InterviewInviteDialog({ 
  isOpen, 
  onClose, 
  type, // 'student' or 'team'
  item, // student or team object
  onSuccess 
}) {
  const [timeOption, setTimeOption] = useState('minutes');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(detectedTimeZone);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!interviewTime.trim()) {
      setError('Please enter interview time');
      return;
    }

    if (timeOption === 'minutes' && (isNaN(interviewTime) || parseInt(interviewTime) < 0)) {
      setError('Please enter a valid number of minutes');
      return;
    }

    if (timeOption === 'datetime') {
      const selectedDate = new Date(interviewTime);
      if (isNaN(selectedDate.getTime())) {
        setError('Please enter a valid date and time');
        return;
      }
      if (selectedDate < new Date()) {
        setError('Interview time cannot be in the past');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = type === 'student' 
        ? `/interviews/invite/student/${item._id}`
        : `/interviews/invite/team/${item._id}`;

      const response = await interviewAPI.sendInvite(endpoint, {
        interviewTime,
        timeOption,
        interviewerName: interviewerName.trim() || undefined,
        timeZone
      });

      if (response.data.success) {
        onSuccess(response.data);
        onClose();
      } else {
        setError(response.data.error || 'Failed to send interview invite');
      }
    } catch (error) {
      console.error('Error sending interview invite:', error);
      setError(error.response?.data?.error || 'Failed to send interview invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTimeOption('minutes');
    setInterviewTime('');
    setInterviewerName('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  // Set default datetime value when switching to datetime option
  const handleTimeOptionChange = (option) => {
    setTimeOption(option);
    if (option === 'datetime' && !interviewTime) {
      // Set default to current time + 1 hour
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      defaultTime.setMinutes(0);
      defaultTime.setSeconds(0);
      defaultTime.setMilliseconds(0);
      setInterviewTime(defaultTime.toISOString().slice(0, 16));
    } else if (option === 'minutes') {
      setInterviewTime('');
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (type === 'student') {
      return `Send Interview Invite to ${item.name}`;
    }
    return `Send Interview Invite to Team ${item.teamNumber}`;
  };

  const getDescription = () => {
    if (type === 'student') {
      return `Send an interview invitation email to ${item.name} (${item.email})`;
    }
    return `Send interview invitation emails to all students in Team ${item.teamNumber} - ${item.projectTitle}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">{getTitle()}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            {getDescription()}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeOption">Interview Time Option</Label>
              <Select value={timeOption} onValueChange={handleTimeOptionChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Minutes from now
                    </div>
                  </SelectItem>
                  <SelectItem value="datetime">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Specific date & time
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewTime">
                {timeOption === 'minutes' ? 'Minutes from now' : 'Interview Date & Time'}
              </Label>
              <Input
                id="interviewTime"
                type={timeOption === 'minutes' ? 'number' : 'datetime-local'}
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                placeholder={timeOption === 'minutes' ? 'e.g., 30' : 'Select date and time'}
                min={timeOption === 'minutes' ? '0' : undefined}
                className="w-full"
              />
              {timeOption === 'datetime' && (
                <p className="text-xs text-muted-foreground">
                  Select a future date and time for the interview
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewerName">Interviewer Name (optional)</Label>
              <Input
                id="interviewerName"
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Enter interviewer name (optional)"
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Invite
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 