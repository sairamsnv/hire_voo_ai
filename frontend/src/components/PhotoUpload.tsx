import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload, Camera, X, Edit, Trash2, Star, Image as ImageIcon,
  Loader2, CheckCircle, AlertCircle, FileImage, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function getCSRFToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return value;
  }
  return '';
}

interface Photo {
  id: string;
  photo_type: 'profile' | 'cover' | 'gallery';
  image_url: string;
  caption: string;
  is_primary: boolean;
  file_size_mb: number;
  uploaded_at: string;
}

interface PhotoUploadProps {
  onPhotoUploaded?: (photo: Photo) => void;
  onPhotoDeleted?: (photoId: string) => void;
  onPhotoUpdated?: (photo: Photo) => void;
  photoType?: 'profile' | 'cover' | 'gallery';
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoUploaded,
  onPhotoDeleted,
  onPhotoUpdated,
  photoType = 'profile',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch user photos
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/photos/?photo_type=${photoType}`, {
        withCredentials: true
      });
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load photos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [photoType, toast]);

  // Load photos when dialog opens
  React.useEffect(() => {
    if (isDialogOpen) {
      fetchPhotos();
    }
  }, [isDialogOpen, fetchPhotos]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, GIF, or WebP image',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('photo_type', photoType);
      formData.append('caption', caption);
      formData.append('is_primary', isPrimary.toString());

      const response = await axios.post('/api/photos/upload/', formData, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCSRFToken(),
          'Content-Type': 'multipart/form-data',
        }
      });

      const newPhoto = response.data;
      setPhotos(prev => [newPhoto, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully!',
      });

      onPhotoUploaded?.(newPhoto);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
      setIsPrimary(false);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Failed to upload photo',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      await axios.delete(`/api/photos/${photoId}/delete/`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCSRFToken(),
        }
      });

      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      onPhotoDeleted?.(photoId);
      
      toast({
        title: 'Success',
        description: 'Photo deleted successfully!',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete photo',
        variant: 'destructive'
      });
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await axios.post(`/api/photos/${photoId}/set-primary/`, {}, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCSRFToken(),
        }
      });

      const updatedPhoto = response.data;
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        is_primary: photo.id === photoId
      })));
      
      onPhotoUpdated?.(updatedPhoto);
      
      toast({
        title: 'Success',
        description: 'Primary photo updated!',
      });
    } catch (error) {
      console.error('Set primary error:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to set primary photo',
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className={`${className}`}>
          <Camera className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Photo Upload</DialogTitle>
          <DialogDescription>
            Upload and manage your {photoType} photos
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload New Photo</Label>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="space-y-4">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                    />
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop an image here, or{' '}
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 underline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JPEG, PNG, GIF, WebP (max 10MB)
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            {/* Upload Options */}
            {selectedFile && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption (optional)</Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption to your photo..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPrimary">Set as primary {photoType} photo</Label>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Photos Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Your {photoType} Photos</Label>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>No {photoType} photos yet</p>
                  <p className="text-sm">Upload your first photo to get started</p>
                </div>
              ) : (
                photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={photo.image_url}
                          alt={photo.caption || 'Photo'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {photo.is_primary && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatFileSize(photo.file_size_mb * 1024 * 1024)}
                            </span>
                          </div>
                          {photo.caption && (
                            <p className="text-sm text-gray-700 mb-1">{photo.caption}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Uploaded {formatDate(photo.uploaded_at)}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-1">
                          {!photo.is_primary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetPrimary(photo.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(photo.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUpload; 