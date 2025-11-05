import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../services/templateService';
import { Button } from '../components/ui/button';
import { Search, Edit, Eye, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, filterType, templates]);

  const loadTemplates = async () => {
    try {
      const response = await templateService.getAllTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
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
    return <div className="flex items-center justify-center h-screen">Loading templates...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt Template Gallery</h1>
        <p className="text-gray-600">Choose a template and customize it for your properties</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            {/* Preview Image */}
            <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              {template.previewImageUrl ? (
                <img src={template.previewImageUrl} alt={template.name} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-16 h-16 text-blue-300" />
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                  {template.type}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/templates/${template.id}/preview`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/templates/${template.id}/editor`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No templates found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
