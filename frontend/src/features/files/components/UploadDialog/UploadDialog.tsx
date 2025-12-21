import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { FileUpload } from '../Shared';
import { EntitySelector } from '../EntitySelector';
import type { EntityOption } from '../EntitySelector';
import type { UploadStats } from '../../types';
import './UploadDialog.scss';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (file: any) => void;
  onUploadError: (error: any) => void;
  onUploadStart: (file: any) => void;
  onUploadComplete: (file: any, success: boolean) => void;
  onQueueChange: (queue: any[]) => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  onUploadComplete,
  onQueueChange
}) => {
  const [selectedEntityType, setSelectedEntityType] = useState<'property' | 'unit' | 'tenant' | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0
  });
  const [keepDialogOpen, setKeepDialogOpen] = useState(true);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSelectedEntityType(null);
      setSelectedEntity(null);
    }
  };

  const handleUploadSuccess = (file: any) => {
    onUploadSuccess(file);
    setUploadStats(prev => ({
      ...prev,
      successful: prev.successful + 1
    }));
  };

  const handleUploadError = (error: any) => {
    onUploadError(error);
    setUploadStats(prev => ({
      ...prev,
      failed: prev.failed + 1
    }));
  };

  const handleUploadStart = (file: any) => {
    onUploadStart(file);
    setUploadStats(prev => ({
      ...prev,
      total: prev.total + 1,
      pending: prev.pending + 1
    }));
  };

  const handleUploadComplete = (file: any, success: boolean) => {
    onUploadComplete(file, success);
    setUploadStats(prev => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      successful: success ? prev.successful + 1 : prev.successful,
      failed: !success ? prev.failed + 1 : prev.failed
    }));
  };

  const handleQueueChange = (queue: any[]) => {
    // Avoid state updates during render by wrapping in setTimeout or checking if mounted
    // However, onQueueChange is usually called from an event handler in FileUpload, so it should be fine.
    // The error suggests FileUpload calls this during render.
    // Let's wrap it in a microtask to be safe if it's being called synchronously during render.
    setTimeout(() => {
        onQueueChange(queue);
        const pending = queue.filter(u => u.status === 'pending').length;
        setUploadStats(prev => ({
        ...prev,
        pending
        }));
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-xl upload-dialog">
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b">
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Select files to upload and associate them with properties, units, or tenants.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-gray-600">
            Select the entity type and ID to upload files to, or choose to upload general files.
          </p>

          <Tabs defaultValue="entity" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entity">Upload to Entity</TabsTrigger>
              <TabsTrigger value="general">General Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="entity" className="space-y-4 bg-white dark:bg-gray-900">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type
                  </label>
                  <Select onValueChange={(value) => {
                    setSelectedEntityType(value as 'property' | 'unit' | 'tenant');
                    setSelectedEntity(null); // Clear selection when type changes
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border shadow-lg">
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="unit">Unit</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedEntityType && (
                  <EntitySelector
                    entityType={selectedEntityType}
                    onEntitySelect={setSelectedEntity}
                    selectedEntity={selectedEntity}
                  />
                )}
              </div>

              {selectedEntity && (
                <FileUpload
                  entityType={selectedEntity.type}
                  entityId={selectedEntity.id}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  onUploadStart={handleUploadStart}
                  onUploadComplete={handleUploadComplete}
                  onQueueChange={handleQueueChange}
                  autoStart={false}
                  showQueueControls={true}
                />
              )}
            </TabsContent>

            <TabsContent value="general" className="space-y-4 bg-white dark:bg-gray-900">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload general files that are not associated with specific properties, units, or tenants.
                  </p>
                </div>

                <FileUpload
                  category="general"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  onUploadStart={handleUploadStart}
                  onUploadComplete={handleUploadComplete}
                  onQueueChange={handleQueueChange}
                  autoStart={false}
                  showQueueControls={true}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Upload Statistics & Controls */}
          {(uploadStats.successful > 0 || uploadStats.failed > 0 || uploadStats.pending > 0) && (
            <div className="upload-stats">
              <div className="stat-item success">
                <span>Successful uploads</span>
                <span>{uploadStats.successful}</span>
              </div>
              {uploadStats.failed > 0 && (
                <div className="stat-item error">
                  <span>Failed uploads</span>
                  <span>{uploadStats.failed}</span>
                </div>
              )}
              {uploadStats.pending > 0 && (
                <div className="stat-item pending">
                  <span>Pending uploads</span>
                  <span>{uploadStats.pending}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={keepDialogOpen}
                  onChange={(e) => setKeepDialogOpen(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Keep dialog open after upload</span>
              </label>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadStats({ total: 0, successful: 0, failed: 0, pending: 0 });
                  setSelectedEntityType(null);
                  setSelectedEntity(null);
                }}
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};