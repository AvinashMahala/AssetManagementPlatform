import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../services/templateService';
import { Button } from '@/componentDesignLibrary';
import { Search, Edit, Eye, Sparkles } from 'lucide-react';
import { Badge } from '@/componentDesignLibrary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/componentDesignLibrary';
import { AppLayout } from '../components/layout/AppLayout';

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  previewImageUrl?: string;
  isActive: boolean;
}

export default function TemplateGallery() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, filterType, templates]);

  const loadTemplates = async () => {
    try {
      setError(null);
      const response = await templateService.getAllTemplates();
      if (response) {
        setTemplates(Array.isArray(response) ? response : []);
      } else {
        console.error('Failed to load templates: No response');
        setTemplates([]);
        setError('Failed to load templates. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
      
      // Check if it's an authentication error
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized') || error?.code === 'UNAUTHORIZED') {
        setError('Authentication required. Please log in to access templates.');
      } else if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to load templates. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTemplates(filtered);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      premium: 'bg-amber-100 text-amber-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <AppLayout title="Templates">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Templates">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Templates</h3>
              <p className="text-red-700 mb-4">{error}</p>
              {error.includes('Authentication required') && (
                <Button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700">
                  Go to Login
                </Button>
              )}
              {!error.includes('Authentication required') && (
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Templates">
      <div className="flex flex-col h-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 space-y-6 px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt Template Gallery</h1>
            <p className="text-gray-600">Choose a template and customize it for your properties</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center rounded">
                          {template.previewImageUrl ? (
                            <img src={template.previewImageUrl} alt={template.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-blue-300" />
                          )}
                        </div>
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(template.type)}>
                        {template.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/templates/${template.id}/editor`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/templates/${template.id}/editor`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Customize
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTemplates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No templates found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
