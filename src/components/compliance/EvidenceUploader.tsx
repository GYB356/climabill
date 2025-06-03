"use client";

import React, { useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceFramework, ComplianceRequirement } from '@/lib/compliance/compliance-framework-registry';
import { ComplianceStatus, ComplianceStatusTracker } from '@/lib/compliance/compliance-status-tracker';
import { useAccessibility } from '@/lib/a11y/accessibility-context';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EvidenceUploaderProps {
  organizationId: string;
  framework: ComplianceFramework;
  complianceStatus: ComplianceStatus;
  onEvidenceUpdated: () => void;
}

interface EvidenceDocument {
  id: string;
  name: string;
  description: string;
  uploadDate: Date;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  requirementIds: string[];
  tags: string[];
  url: string;
}

/**
 * Evidence Uploader component
 * Manages evidence documents for compliance requirements
 */
export default function EvidenceUploader({ 
  organizationId, 
  framework, 
  complianceStatus,
  onEvidenceUpdated
}: EvidenceUploaderProps) {
  const { t } = useTranslation('compliance');
  const { announce } = useAccessibility();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const complianceStatusTracker = new ComplianceStatusTracker();
  
  // State for evidence documents
  const [documents, setDocuments] = useState<EvidenceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  
  // State for upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedRequirementIds, setSelectedRequirementIds] = useState<string[]>([]);
  const [documentTags, setDocumentTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // State for delete confirmation
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load evidence documents
  React.useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, this would fetch from Firestore
        // For now, we'll simulate with mock data
        const mockDocuments: EvidenceDocument[] = [
          {
            id: 'doc-001',
            name: 'GHG Emissions Report 2023',
            description: 'Annual greenhouse gas emissions report for fiscal year 2023',
            uploadDate: new Date(2023, 11, 15),
            fileType: 'pdf',
            fileSize: 2456789,
            uploadedBy: 'jane.doe@example.com',
            requirementIds: ['ghg-protocol-req-001', 'ghg-protocol-req-002'],
            tags: ['emissions', 'annual-report', 'verified'],
            url: '#'
          },
          {
            id: 'doc-002',
            name: 'Energy Consumption Data',
            description: 'Monthly energy consumption data for all facilities',
            uploadDate: new Date(2023, 10, 5),
            fileType: 'xlsx',
            fileSize: 1245678,
            uploadedBy: 'john.smith@example.com',
            requirementIds: ['ghg-protocol-req-003'],
            tags: ['energy', 'raw-data', 'monthly'],
            url: '#'
          },
          {
            id: 'doc-003',
            name: 'Third-Party Verification Statement',
            description: 'Independent verification of GHG emissions data by EcoVerify Ltd',
            uploadDate: new Date(2023, 11, 20),
            fileType: 'pdf',
            fileSize: 987654,
            uploadedBy: 'jane.doe@example.com',
            requirementIds: ['ghg-protocol-req-005'],
            tags: ['verification', 'third-party', 'assurance'],
            url: '#'
          }
        ];
        
        // Filter to only show documents related to this framework's requirements
        const frameworkRequirementIds = framework.requirements.map(req => req.id);
        const filteredDocuments = mockDocuments.filter(doc => 
          doc.requirementIds.some(reqId => frameworkRequirementIds.includes(reqId))
        );
        
        setDocuments(filteredDocuments);
        setIsLoading(false);
        
        announce(t('compliance.evidenceDocumentsLoaded', { count: filteredDocuments.length }), false);
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : String(err));
        announce(t('compliance.errorLoadingDocuments'), true);
      }
    };
    
    loadDocuments();
  }, [framework.id, complianceStatus.id, announce, t]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
  };
  
  // Handle file type filter change
  const handleFileTypeFilterChange = (value: string) => {
    setFileTypeFilter(value);
  };
  
  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(document => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter (based on requirements)
    const matchesCategory = categoryFilter === 'all' || 
      document.requirementIds.some(reqId => {
        const req = framework.requirements.find(r => r.id === reqId);
        return req && req.category === categoryFilter;
      });
    
    // File type filter
    const matchesFileType = fileTypeFilter === 'all' || document.fileType === fileTypeFilter;
    
    return matchesSearch && matchesCategory && matchesFileType;
  });
  
  // Get unique file types from documents
  const fileTypes = ['all', ...new Set(documents.map(doc => doc.fileType))];
  
  // Get unique categories from requirements
  const categories = ['all', ...new Set(framework.requirements.map(req => req.category))];
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingFile(file);
      
      // Auto-fill name from filename (without extension)
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setDocumentName(fileName);
      
      announce(t('compliance.fileSelected', { name: file.name }), false);
    }
  };
  
  // Open file browser
  const openFileBrowser = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget.value.trim();
      if (input && !documentTags.includes(input)) {
        setDocumentTags([...documentTags, input]);
        e.currentTarget.value = '';
      }
    }
  };
  
  // Remove tag
  const removeTag = (tag: string) => {
    setDocumentTags(documentTags.filter(t => t !== tag));
  };
  
  // Toggle requirement selection
  const toggleRequirementSelection = (requirementId: string) => {
    if (selectedRequirementIds.includes(requirementId)) {
      setSelectedRequirementIds(selectedRequirementIds.filter(id => id !== requirementId));
    } else {
      setSelectedRequirementIds([...selectedRequirementIds, requirementId]);
    }
  };
  
  // Handle document upload
  const handleUpload = async () => {
    if (!uploadingFile) {
      setUploadError(t('compliance.noFileSelected'));
      return;
    }
    
    if (!documentName.trim()) {
      setUploadError(t('compliance.noDocumentName'));
      return;
    }
    
    if (selectedRequirementIds.length === 0) {
      setUploadError(t('compliance.noRequirementsSelected'));
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // In a real implementation, this would upload to storage and create a document in Firestore
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new document
      const newDocument: EvidenceDocument = {
        id: `doc-${Date.now()}`,
        name: documentName,
        description: documentDescription,
        uploadDate: new Date(),
        fileType: uploadingFile.name.split('.').pop() || 'unknown',
        fileSize: uploadingFile.size,
        uploadedBy: 'current.user@example.com', // In a real app, this would be the current user
        requirementIds: selectedRequirementIds,
        tags: documentTags,
        url: '#'
      };
      
      // Update state
      setDocuments([...documents, newDocument]);
      
      // Update requirement statuses with the new evidence document
      for (const requirementId of selectedRequirementIds) {
        const requirementStatus = complianceStatus.requirementStatuses.find(
          rs => rs.requirementId === requirementId
        );
        
        if (requirementStatus) {
          // In a real implementation, this would update the status in Firestore
          await complianceStatusTracker.addEvidenceToRequirement(
            complianceStatus.id,
            requirementId,
            newDocument.id
          );
        }
      }
      
      // Reset form
      setUploadingFile(null);
      setDocumentName('');
      setDocumentDescription('');
      setSelectedRequirementIds([]);
      setDocumentTags([]);
      setIsUploading(false);
      setIsUploadDialogOpen(false);
      
      // Notify parent component
      onEvidenceUpdated();
      
      announce(t('compliance.documentUploaded', { name: newDocument.name }), false);
    } catch (err) {
      setIsUploading(false);
      setUploadError(err instanceof Error ? err.message : String(err));
      announce(t('compliance.errorUploadingDocument'), true);
    }
  };
  
  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    setDocumentToDelete(documentId);
  };
  
  // Confirm document deletion
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // In a real implementation, this would delete from storage and Firestore
      // For now, we'll simulate the deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get document to delete
      const documentToDeleteObj = documents.find(doc => doc.id === documentToDelete);
      
      if (documentToDeleteObj) {
        // Remove document from requirement statuses
        for (const requirementId of documentToDeleteObj.requirementIds) {
          // In a real implementation, this would update the status in Firestore
          await complianceStatusTracker.removeEvidenceFromRequirement(
            complianceStatus.id,
            requirementId,
            documentToDelete
          );
        }
      }
      
      // Update state
      setDocuments(documents.filter(doc => doc.id !== documentToDelete));
      setDocumentToDelete(null);
      setIsDeleting(false);
      
      // Notify parent component
      onEvidenceUpdated();
      
      announce(t('compliance.documentDeleted'), false);
    } catch (err) {
      setIsDeleting(false);
      setError(err instanceof Error ? err.message : String(err));
      announce(t('compliance.errorDeletingDocument'), true);
    }
  };
  
  // Cancel document deletion
  const cancelDelete = () => {
    setDocumentToDelete(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Evidence Documents */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>{t('compliance.evidenceDocuments')}</CardTitle>
              <CardDescription>{t('compliance.evidenceDocumentsDescription')}</CardDescription>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {t('compliance.uploadEvidence')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('compliance.searchDocuments')}
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('compliance.filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' 
                      ? t('compliance.allCategories') 
                      : t(`compliance.category.${category}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fileTypeFilter} onValueChange={handleFileTypeFilterChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('compliance.filterByFileType')} />
              </SelectTrigger>
              <SelectContent>
                {fileTypes.map(fileType => (
                  <SelectItem key={fileType} value={fileType}>
                    {fileType === 'all' 
                      ? t('compliance.allFileTypes') 
                      : fileType.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('compliance.error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Documents Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">{t('compliance.loadingDocuments')}</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">{t('compliance.noDocumentsFound')}</h3>
              <p className="text-sm text-muted-foreground">{t('compliance.noDocumentsFoundDescription')}</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                {t('compliance.uploadFirstDocument')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('compliance.documentName')}</TableHead>
                  <TableHead>{t('compliance.uploadDate')}</TableHead>
                  <TableHead>{t('compliance.fileType')}</TableHead>
                  <TableHead>{t('compliance.fileSize')}</TableHead>
                  <TableHead>{t('compliance.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map(document => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="font-medium">{document.name}</div>
                      <div className="text-sm text-muted-foreground">{document.description}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {document.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {document.uploadDate.toLocaleDateString()}
                      <div className="text-sm text-muted-foreground">
                        {t('compliance.uploadedBy', { user: document.uploadedBy.split('@')[0] })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {document.fileType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatFileSize(document.fileSize)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('compliance.viewDocument')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('compliance.downloadDocument')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDelete(document.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('compliance.deleteDocument')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            {t('compliance.showingDocuments', { 
              count: filteredDocuments.length,
              total: documents.length
            })}
          </div>
        </CardFooter>
      </Card>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('compliance.uploadEvidenceDocument')}</DialogTitle>
            <DialogDescription>
              {t('compliance.uploadEvidenceDocumentDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {/* Upload Form */}
          <div className="space-y-4 py-4">
            {/* File Upload */}
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="file" className="text-sm font-medium">
                {t('compliance.selectFile')}
              </label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={openFileBrowser}
                  className="w-full h-24 flex flex-col items-center justify-center border-dashed"
                >
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span>{t('compliance.dragAndDropOrClick')}</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              {uploadingFile && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{uploadingFile.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {formatFileSize(uploadingFile.size)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Document Name */}
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                {t('compliance.documentName')}
              </label>
              <Input
                id="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder={t('compliance.documentNamePlaceholder')}
              />
            </div>
            
            {/* Document Description */}
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="description" className="text-sm font-medium">
                {t('compliance.documentDescription')}
              </label>
              <Textarea
                id="description"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder={t('compliance.documentDescriptionPlaceholder')}
                rows={3}
              />
            </div>
            
            {/* Related Requirements */}
            <div className="grid w-full items-center gap-1.5">
              <label className="text-sm font-medium">
                {t('compliance.relatedRequirements')}
              </label>
              <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                {framework.requirements.map(requirement => (
                  <div key={requirement.id} className="flex items-center gap-2 mb-2 last:mb-0">
                    <input
                      type="checkbox"
                      id={`req-${requirement.id}`}
                      checked={selectedRequirementIds.includes(requirement.id)}
                      onChange={() => toggleRequirementSelection(requirement.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`req-${requirement.id}`} className="text-sm">
                      {requirement.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tags */}
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="tags" className="text-sm font-medium">
                {t('compliance.documentTags')}
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {documentTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button 
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="tags"
                placeholder={t('compliance.tagInputPlaceholder')}
                onKeyDown={handleTagInput}
              />
              <p className="text-xs text-muted-foreground">
                {t('compliance.tagInputHelp')}
              </p>
            </div>
            
            {/* Upload Error */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('compliance.uploadError')}</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              {t('compliance.cancel')}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? t('compliance.uploading') : t('compliance.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!documentToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('compliance.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('compliance.confirmDeleteDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              {t('compliance.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? t('compliance.deleting') : t('compliance.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
