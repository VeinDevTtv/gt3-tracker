import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'react-hot-toast';
import { User, Camera } from 'lucide-react';

const ProfilePanel = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(currentUser?.username || '');
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setLoading(true);
          await updateProfile({
            profilePicture: event.target.result,
            username: name
          });
          toast.success('Profile picture updated');
        } catch (error) {
          toast.error('Failed to update profile picture');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        username: name,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      
      <div className="flex flex-col items-center mb-6">
        <div 
          className="w-32 h-32 rounded-full bg-muted-foreground/20 overflow-hidden cursor-pointer mb-4 flex items-center justify-center border-2 border-primary-color relative"
          onClick={handleImageClick}
        >
          {currentUser?.profilePicture ? (
            <img 
              src={currentUser.profilePicture} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-muted-foreground" />
          )}
          <div className="absolute bottom-0 right-0 bg-primary-color text-white p-1 rounded-full shadow-sm">
            <Camera size={16} />
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageChange}
        />
        <p className="text-sm text-muted-foreground">Click to change your profile picture</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="displayName" className="mb-1">
            Display Name
          </Label>
          <Input
            id="displayName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full"
          />
        </div>
        
        <Button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="w-full"
          variant="default"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePanel; 