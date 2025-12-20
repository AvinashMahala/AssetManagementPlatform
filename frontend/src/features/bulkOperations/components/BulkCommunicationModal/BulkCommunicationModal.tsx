import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Label } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Checkbox } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Alert, AlertDescription } from '@/componentDesignLibrary';
import {
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Send,
} from 'lucide-react';
import { bulkOperationsService } from '@/services';
import { useNotifications } from '@/contexts';
import type { BulkCommunicationInput, BulkOperationResult } from '@/features/bulkOperations/types';
import { tenantService } from '@/services';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  unitId?: string;
  unitNumber?: string;
  propertyName?: string;
}

interface BulkCommunicationModalProps {
  onClose: () => void;
  open?: boolean;
}

export const BulkCommunicationModal: React.FC<BulkCommunicationModalProps> = ({ onClose, open }) => {
  const [step, setStep] = useState<'select' | 'compose' | 'confirm' | 'processing' | 'result'>('select');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  // Communication form data
  const [channels, setChannels] = useState<('email' | 'sms' | 'whatsapp')[]>(['email']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includePaymentReminders, setIncludePaymentReminders] = useState(false);
  const [sendImmediately, setSendImmediately] = useState(true);

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await tenantService.getAll();
      if (response.success && response.data) {
        // Enrich tenants with unit and property information
        const enrichedTenants = response.data.map((tenant: any) => ({
          ...tenant,
          unitNumber: tenant.unit?.unitNumber || 'N/A',
          propertyName: tenant.unit?.property?.name || 'N/A',
        }));
        setTenants(enrichedTenants);
      } else {
        throw new Error('Failed to load tenants');
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load tenants',
      });
    }
  };

  const handleTenantToggle = (tenantId: string) => {
    setSelectedTenants(prev =>
      prev.includes(tenantId)
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTenants(tenants.map(tenant => tenant.id));
    } else {
      setSelectedTenants([]);
    }
  };

  const handleNext = () => {
    if (step === 'select' && selectedTenants.length > 0) {
      setStep('compose');
    } else if (step === 'compose') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'compose') {
      setStep('select');
    } else if (step === 'confirm') {
      setStep('compose');
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide both subject and message',
      });
      return;
    }

    setStep('processing');
    setProcessing(true);

    try {
      const input: BulkCommunicationInput = {
        tenantIds: selectedTenants,
        subject: subject.trim(),
        message: message.trim(),
        channels,
      };

      const result = await bulkOperationsService.bulkTenantCommunication(input);
      setResult(result);

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Bulk Communication Sent',
          message: `Successfully sent to ${result.processed} tenants, ${result.failed} failed`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Bulk Communication Failed',
          message: result.errors.join(', '),
        });
      }
    } catch (error) {
      console.error('Bulk communication error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send bulk communication',
      });
      setResult({
        success: false,
        processed: 0,
        failed: selectedTenants.length,
        errors: ['Operation failed'],
      });
    } finally {
      setProcessing(false);
      setStep('result');
    }
  };

  const resetModal = () => {
    setStep('select');
    setSelectedTenants([]);
    setResult(null);
    setSubject('');
    setMessage('');
    setChannels(['email']);
    setIncludePaymentReminders(false);
    setSendImmediately(true);
  };

  const renderTenantSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Select Tenants for Communication</h3>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelectAll(selectedTenants.length !== tenants.length)}
          >
            {selectedTenants.length === tenants.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Badge variant="secondary">
            {selectedTenants.length} selected
          </Badge>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className={`flex items-center space-x-3 p-3 rounded border cursor-pointer transition-colors ${
              selectedTenants.includes(tenant.id)
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => handleTenantToggle(tenant.id)}
          >
            <Checkbox
              checked={selectedTenants.includes(tenant.id)}
              onChange={() => {}} // Controlled by parent click
            />
            <Users className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <div className="font-medium">
                {tenant.firstName} {tenant.lastName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {tenant.email} • {tenant.phone || 'No phone'}
              </div>
              <div className="text-xs text-gray-500">
                Unit {tenant.unitNumber} • {tenant.propertyName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComposeMessage = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Compose Message</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Communication Channels</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={channels.includes('email')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setChannels(prev => [...prev, 'email']);
                  } else {
                    setChannels(prev => prev.filter(c => c !== 'email'));
                  }
                }}
              />
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms"
                checked={channels.includes('sms')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setChannels(prev => [...prev, 'sms']);
                  } else {
                    setChannels(prev => prev.filter(c => c !== 'sms'));
                  }
                }}
              />
              <Label htmlFor="sms" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="whatsapp"
                checked={channels.includes('whatsapp')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setChannels(prev => [...prev, 'whatsapp']);
                  } else {
                    setChannels(prev => prev.filter(c => c !== 'whatsapp'));
                  }
                }}
              />
              <Label htmlFor="whatsapp" className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                WhatsApp
              </Label>
            </div>
          </div>
        </div>

        {channels.includes('email') && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={channels.includes('sms') ? 'Enter your message (SMS: 160 characters max)' : 'Enter your message'}
            rows={6}
            maxLength={channels.includes('sms') && !channels.includes('email') && !channels.includes('whatsapp') ? 160 : undefined}
          />
          {channels.includes('sms') && !channels.includes('email') && !channels.includes('whatsapp') && (
            <div className="text-sm text-gray-500 text-right">
              {message.length}/160 characters
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="payment-reminders"
              checked={includePaymentReminders}
              onCheckedChange={(checked) => setIncludePaymentReminders(checked as boolean)}
            />
            <Label htmlFor="payment-reminders">Include payment reminders for overdue tenants</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-immediately"
              checked={sendImmediately}
              onCheckedChange={(checked) => setSendImmediately(checked as boolean)}
            />
            <Label htmlFor="send-immediately">Send immediately</Label>
          </div>
        </div>
      </div>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          This message will be sent to {selectedTenants.length} selected tenant{selectedTenants.length !== 1 ? 's' : ''}.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Confirm Bulk Communication</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Recipients</span>
          </div>
          <Badge variant="secondary">{selectedTenants.length} tenants</Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-green-500" />
            <span className="font-medium">Communication Type</span>
          </div>
          <div className="flex space-x-2">
            {channels.includes('email') && <Badge variant="outline">Email</Badge>}
            {channels.includes('sms') && <Badge variant="outline">SMS</Badge>}
            {channels.includes('whatsapp') && <Badge variant="outline">WhatsApp</Badge>}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-medium mb-2">Subject:</div>
          <div className="text-sm">{subject || '(No subject)'}</div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="font-medium mb-2">Message:</div>
          <div className="text-sm whitespace-pre-wrap">{message}</div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Options</span>
          </div>
          <div className="flex space-x-2">
            {includePaymentReminders && <Badge variant="outline">Payment Reminders</Badge>}
            {sendImmediately && <Badge variant="outline">Send Immediately</Badge>}
          </div>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This action will send the communication to all selected tenants. Please verify the message content before proceeding.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
      <div>
        <h3 className="text-lg font-medium">Sending Bulk Communication</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sending messages to {selectedTenants.length} tenants...
        </p>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center">
        {result?.success ? (
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        )}
        <h3 className="text-lg font-medium mt-4">
          {result?.success ? 'Bulk Communication Completed' : 'Bulk Communication Failed'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{result?.processed || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sent Successfully</div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{result?.failed || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
        </div>
      </div>

      {result?.errors && result.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {result.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'select':
        return renderTenantSelection();
      case 'compose':
        return renderComposeMessage();
      case 'confirm':
        return renderConfirmation();
      case 'processing':
        return renderProcessing();
      case 'result':
        return renderResult();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'select':
        return 'Select Tenants';
      case 'compose':
        return 'Compose Message';
      case 'confirm':
        return 'Confirm Communication';
      case 'processing':
        return 'Sending';
      case 'result':
        return 'Results';
      default:
        return 'Bulk Communication';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'select':
        return selectedTenants.length > 0;
      case 'compose':
        return (!channels.includes('email') || subject.trim()) && message.trim() && channels.length > 0;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>{getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            Send bulk communications to multiple tenants
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {getStepContent()}
        </div>

        <DialogFooter>
          {step === 'result' ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetModal}>
                Send Another Message
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step !== 'select' && step !== 'processing' && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {step === 'confirm' && (
                <Button onClick={handleSubmit} disabled={processing}>
                  {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Communication
                </Button>
              )}
              {step !== 'confirm' && step !== 'processing' && (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};