import { User, Mail, Building2, MapPin, Phone, Edit, Save, X, Camera } from 'lucide-react';
import { useState } from 'react';
import type { User as UserType } from '../../types';
import { authService } from '../../services/api';
import { toast } from 'sonner';

interface ProfileProps {
  user: UserType | null;
  onUpdateUser: (user: UserType) => void;
}

export function Profile({ user, onUpdateUser }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: user?.phone || '',
    address: user?.address || '',
    image: user?.image || ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await authService.updateProfile({
        id: user?.id,
        ...formData
      });

      if (res.data.success) {
        const updatedUser: UserType = {
          ...user!,
          name: res.data.user.name,
          email: res.data.user.email,
          company: res.data.user.company,
          phone: res.data.user.phone,
          address: res.data.user.address,
          image: res.data.user.image
        };
        onUpdateUser(updatedUser);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
      phone: user?.phone || '',
      address: user?.address || '',
      image: user?.image || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your business account information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-blue-600 text-black text-black text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600 text-black/20 transition-all flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-all flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 text-black text-black text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600 text-black/20 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className={`w-24 h-24 ${formData.image ? '' : 'bg-gradient-to-br from-blue-500 to-blue-700'} rounded-3xl flex items-center justify-center mb-6 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform overflow-hidden`}>
                    {formData.image ? (
                      <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <label
                      className="absolute bottom-4 right-[-10px] bg-white text-blue-600 text-black p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform border border-blue-50"
                      aria-label="Upload profile picture"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          document.getElementById('profile-upload')?.click();
                        }
                      }}
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        aria-label="Upload profile picture"
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{user?.name}</h2>
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                  Customer Partner
                </span>
                <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[200px]">
                  Managing account for <span className="text-blue-600 text-black font-bold">{user?.company || 'ISDN Distribution'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Details
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border border-transparent rounded-xl flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600 text-black" />
                      <span className="text-gray-900 font-bold">{user?.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border border-transparent rounded-xl flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600 text-black" />
                      <span className="text-gray-900 font-bold">{user?.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="+94 7X XXX XXXX"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border border-transparent rounded-xl flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600 text-black" />
                      <span className="text-gray-900 font-bold">{user?.phone || 'Add phone number'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Entity
              </h3>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Organization Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border border-transparent rounded-xl flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-600 text-black" />
                      <span className="text-gray-900 font-bold">{user?.company || 'Add company name'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Business Address</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white border border-transparent rounded-xl flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 text-black mt-1" />
                      <span className="text-gray-900 font-bold leading-relaxed">{user?.address || 'Add business address'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
