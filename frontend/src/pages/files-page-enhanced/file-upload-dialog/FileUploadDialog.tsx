import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Upload, X } from 'lucide-react';
import { EntitySelector } from '../entity-selector';
import type { FileUploadDialogProps } from './FileUploadDialog.types';

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onOpenChange,
  selectedEntityType,
  selectedEntity,
  onEntityTypeChange,
  onEntitySelect,
  uploadStats,
  keepDialogOpen,
  onKeepDialogOpenChange,
  onUpload
}) => {
  const [generalFiles, setGeneralFiles] = useState<File[]>([]);

  const handleGeneralFileSelect = (files: File[]) => {
    setGeneralFiles(files);
  };

  const handleGeneralUpload = () => {
    onUpload(generalFiles, null, null);
    if (!keepDialogOpen) {
      setGeneralFiles([]);
    }
  };

  const handleEntityUpload = () => {
    if (selectedEntityType && selectedEntity) {
      onUpload([], selectedEntityType, selectedEntity);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-xl upload-dialog">
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b">
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-gray-600">
            Select the entity type and ID to upload files to, or choose to upload general files.
          </p>

          <Tabs defaultValue="entity" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entity">Upload to Entity</TabsTrigger>
              <TabsTrigger value="general">General Files</TabsTrigger>
            </TabsList>

            <TabsContent value="entity" className="space-y-4 bg-white dark:bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Entity Type</label>
                  <select
                    value={selectedEntityType || ''}
                    onChange={(e) => onEntityTypeChange(e.target.value as 'property' | 'unit' | 'tenant' | null)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select type</option>
                    <option value="property">Property</option>
                    <option value="unit">Unit</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </div>

                {selectedEntityType && (
                  <EntitySelector
                    entityType={selectedEntityType}
                    onEntitySelect={onEntitySelect}
                    selectedEntity={selectedEntity}
                  />
                )}
              </div>

              {selectedEntity && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag and drop files here, or click to select
                  </p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="entity-file-upload"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      onUpload(files, selectedEntityType, selectedEntity);
                    }}
                  />
                  <label htmlFor="entity-file-upload">
                    <Button variant="outline" className="mt-2">
                      Select Files
                    </Button>
                  </label>
                </div>
              )}
            </TabsContent>

            <TabsContent value="general" className="space-y-4 bg-white dark:bg-gray-900">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop general files here, or click to select
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="general-file-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleGeneralFileSelect(files);
                  }}
                />
                <label htmlFor="general-file-upload">
                  <Button variant="outline" className="mt-2">
                    Select Files
                  </Button>
                </label>
              </div>

              {generalFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files:</h4>
                  {generalFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setGeneralFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Upload Statistics & Controls */}
          {(uploadStats.successful > 0 || uploadStats.failed > 0 || uploadStats.pending > 0) && (
            <div className="upload-stats">
              <div className="text-sm">
                <span className="text-green-600">✓ {uploadStats.successful} successful</span>
                {uploadStats.failed > 0 && (
                  <span className="text-red-600 ml-4">✗ {uploadStats.failed} failed</span>
                )}
                {uploadStats.pending > 0 && (
                  <span className="text-blue-600 ml-4">⟳ {uploadStats.pending} pending</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="keep-open"
                checked={keepDialogOpen}
                onChange={(e) => onKeepDialogOpenChange(e.target.checked)}
              />
              <label htmlFor="keep-open" className="text-sm">
                Keep dialog open after upload
              </label>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {selectedEntity && (
                <Button onClick={handleEntityUpload}>
                  Upload to {selectedEntity.name}
                </Button>
              )}
              {generalFiles.length > 0 && (
                <Button onClick={handleGeneralUpload}>
                  Upload General Files
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};