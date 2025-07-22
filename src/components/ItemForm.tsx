'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react';
import { CreateItemRequest, UpdateItemRequest, LinkType } from '@/types';
import { getLinkTypeColor, isValidUrl } from '@/lib/utils';

// Generate a random UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface ItemFormProps {
  item?: UpdateItemRequest;
  onSave: (item: CreateItemRequest | UpdateItemRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface LinkFormData {
  id?: string;
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl: string;
  displayOrder: number;
}

export default function ItemForm({ item, onSave, onCancel, loading = false }: ItemFormProps) {
  const [formData, setFormData] = useState({
    publicId: item?.publicId || '',
    name: item?.name || '',
    description: item?.description || '',
    qrCodeUrl: item?.qrCodeUrl || '',
  });

  // Generate UUID for new items
  useEffect(() => {
    if (!item && !formData.publicId) {
      setFormData(prev => ({
        ...prev,
        publicId: generateUUID()
      }));
    }
  }, [item, formData.publicId]);

  const [links, setLinks] = useState<LinkFormData[]>(
    item?.links?.map((link, index) => ({
      id: link.id || undefined,
      title: link.title,
      linkType: link.linkType,
      url: link.url,
      thumbnailUrl: link.thumbnailUrl || '',
      displayOrder: link.displayOrder,
    })) || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.publicId.trim()) {
      newErrors.publicId = 'Public ID is required';
    } else if (!/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(formData.publicId)) {
      newErrors.publicId = 'Public ID must be a valid UUID format';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.qrCodeUrl && !isValidUrl(formData.qrCodeUrl)) {
      newErrors.qrCodeUrl = 'Please enter a valid QR code image URL';
    }

    links.forEach((link, index) => {
      if (!link.title.trim()) {
        newErrors[`link-${index}-title`] = 'Title is required';
      }
      if (!link.url.trim()) {
        newErrors[`link-${index}-url`] = 'URL is required';
      } else if (!isValidUrl(link.url)) {
        newErrors[`link-${index}-url`] = 'Please enter a valid URL';
      }
      if (link.thumbnailUrl && !isValidUrl(link.thumbnailUrl)) {
        newErrors[`link-${index}-thumbnail`] = 'Please enter a valid thumbnail URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const itemData = {
      ...formData,
      qrCodeUrl: formData.qrCodeUrl || undefined,
      links: links.map((link, index) => ({
        id: link.id,
        title: link.title,
        linkType: link.linkType,
        url: link.url,
        thumbnailUrl: link.thumbnailUrl || undefined,
        displayOrder: index,
      })),
    };

    if (item?.id) {
      await onSave({ ...itemData, id: item.id } as UpdateItemRequest);
    } else {
      await onSave(itemData as CreateItemRequest);
    }
  };

  const addLink = () => {
    setLinks([...links, {
      title: '',
      linkType: 'text',
      url: '',
      thumbnailUrl: '',
      displayOrder: links.length,
    }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof LinkFormData, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === links.length - 1)
    ) {
      return;
    }

    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setLinks(newLinks);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {item ? 'Edit Item' : 'Create New Item'}
            </h1>
            <p className="text-gray-600 mt-1">
              {item ? 'Update item details and resources' : 'Add a new item with instructions and resources'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="publicId" className="block text-sm font-medium text-gray-700 mb-2">
                  Public ID *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="publicId"
                    value={formData.publicId}
                    readOnly={!!item}
                    onChange={!item ? (e) => setFormData({ ...formData, publicId: e.target.value }) : undefined}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.publicId ? 'border-red-300' : 'border-gray-300'
                    } ${item ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="UUID will be generated automatically"
                  />
                  {!item && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, publicId: generateUUID() })}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Generate new UUID"
                    >
                      🔄
                    </button>
                  )}
                </div>
                {errors.publicId && (
                  <p className="text-red-600 text-sm mt-1">{errors.publicId}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  {item 
                    ? 'Public ID cannot be changed after creation'
                    : 'This UUID will be used in the QR code URL (e.g., faqbnb.com/item/8d678bd0-e4f7-495f-b4cd-43756813e23a)'
                  }
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Samsung Washing Machine"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the item, its location, or any important details..."
              />
            </div>

            {/* QR Code URL */}
            <div>
              <label htmlFor="qrCodeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Image URL (optional)
              </label>
              <input
                type="url"
                id="qrCodeUrl"
                value={formData.qrCodeUrl}
                onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.qrCodeUrl ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com/qr-code.png"
              />
              {errors.qrCodeUrl && (
                <p className="text-red-600 text-sm mt-1">{errors.qrCodeUrl}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                URL to the QR code image for this item. Leave empty if no QR code is available.
              </p>
              {formData.qrCodeUrl && (
                <div className="mt-2">
                  <img
                    src={formData.qrCodeUrl}
                    alt="QR Code Preview"
                    className="w-24 h-24 object-contain border border-gray-200 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Links Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Resources & Links</h3>
                <button
                  type="button"
                  onClick={addLink}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </button>
              </div>

              {links.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No resources added yet</p>
                  <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Resource
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLinkTypeColor(link.linkType)}`}>
                            {link.linkType.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => moveLink(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLink(index, 'down')}
                            disabled={index === links.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateLink(index, 'title', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`link-${index}-title`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., User Manual"
                          />
                          {errors[`link-${index}-title`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`link-${index}-title`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={link.linkType}
                            onChange={(e) => updateLink(index, 'linkType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="youtube">YouTube Video</option>
                            <option value="pdf">PDF Document</option>
                            <option value="image">Image</option>
                            <option value="text">Web Link</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL *
                          </label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`link-${index}-url`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="https://..."
                          />
                          {errors[`link-${index}-url`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`link-${index}-url`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Thumbnail URL
                          </label>
                          <input
                            type="url"
                            value={link.thumbnailUrl}
                            onChange={(e) => updateLink(index, 'thumbnailUrl', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`link-${index}-thumbnail`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="https://... (optional)"
                          />
                          {errors[`link-${index}-thumbnail`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`link-${index}-thumbnail`]}</p>
                          )}
                          <p className="text-gray-500 text-sm mt-1">
                            Leave empty to auto-generate thumbnails
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

