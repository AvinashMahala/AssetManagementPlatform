import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';

export interface DataAuditIssue {
  field: string;
  requested: any;
  stored: any;
  reason: string;
}

export interface DataAuditResult {
  success: boolean;
  issues: DataAuditIssue[];
}

interface AdminAuditModalProps {
  open: boolean;
  audit?: DataAuditResult | null;
  title?: string;
  onClose: () => void;
  onView?: () => void; // optional action to view the created/updated entity
}

export const AdminAuditModal: React.FC<AdminAuditModalProps> = ({ open, audit, title = 'Data Audit Results', onClose, onView }) => {
  const issues = audit?.issues ?? [];
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            The system detected differences between your requested values and the persisted record. Review the issues below.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {issues.length === 0 ? (
            <div className="text-sm text-gray-600">No issues were found.</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {issues.map((it, idx) => (
                <div key={idx} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{it.field}</div>
                      <div className="text-xs text-muted-foreground mt-1">Reason: <span className="font-medium">{it.reason}</span></div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Requested</div>
                      <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono text-gray-700 dark:text-gray-200">{typeof it.requested === 'object' ? JSON.stringify(it.requested) : String(it.requested ?? '')}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Stored</div>
                      <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono text-gray-700 dark:text-gray-200">{typeof it.stored === 'object' ? JSON.stringify(it.stored) : String(it.stored ?? '')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <div className="flex items-center justify-between w-full">
            <div />
            <div className="flex items-center space-x-2">
              {onView && (
                <Button type="button" variant="outline" onClick={onView}>
                  View record
                </Button>
              )}
              <Button type="button" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAuditModal;
