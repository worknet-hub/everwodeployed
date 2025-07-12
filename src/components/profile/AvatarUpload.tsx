import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload = ({ 
  currentAvatar, 
  userName, 
  onAvatarChange,
  size = 'md' 
}: AvatarUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let file = event.target.files[0];
      // Compress image if it's an image file
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        const reader = new FileReader();
        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          reader.onload = (e) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const loadedImg = await loadPromise;
        // Resize/compress
        const canvas = document.createElement('canvas');
        const maxDim = 512;
        let width = loadedImg.width;
        let height = loadedImg.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(loadedImg, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          // Convert dataURL to Blob
          const res = await fetch(dataUrl);
          file = new File([await res.blob()], file.name, { type: 'image/jpeg' });
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file to path:', filePath);

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', data.publicUrl);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      onAvatarChange(data.publicUrl);
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Error uploading avatar');
    } finally {
      setUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = async () => {
    if (!user?.id) return;
    try {
      setUploading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
      if (error) throw error;
      onAvatarChange('');
      toast.success('Profile picture removed!');
    } catch (error: any) {
      toast.error(error.message || 'Error removing profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className={`${sizeClasses[size]} cursor-pointer`} onClick={triggerFileInput}>
        <AvatarImage src={currentAvatar} />
        <AvatarFallback className="text-lg">
          {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {/* Upload overlay */}
      <div 
        className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center`}
        onClick={triggerFileInput}
      >
        {uploading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
        className="hidden"
      />

      {currentAvatar && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={removeAvatar}
          disabled={uploading}
        >
          Remove Profile Picture
        </Button>
      )}
    </div>
  );
};
