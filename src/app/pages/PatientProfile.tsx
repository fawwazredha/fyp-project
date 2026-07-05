import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Save, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
}

const EMPTY_PROFILE: ProfileData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  emergencyContact: '',
};

export function PatientProfile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isEditing,    setIsEditing]    = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSaving,     setIsSaving]     = useState(false);
  const [profileData,  setProfileData]  = useState<ProfileData>(EMPTY_PROFILE);
  const [savedData,    setSavedData]    = useState<ProfileData>(EMPTY_PROFILE);

  // ─── Fetch from Flask DB ──────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/profile/${user.id}`);
      const result   = await response.json();

      if (response.ok && result.status === 'success' && result.profile) {
        const fetched: ProfileData = {
          name:             result.profile.name             || user.name  || '',
          email:            result.profile.email            || user.email || '',
          phone:            result.profile.phone            || '',
          address:          result.profile.address          || '',
          dateOfBirth:      result.profile.dateOfBirth      || '',
          emergencyContact: result.profile.emergencyContact || '',
        };
        setProfileData(fetched);
        setSavedData(fetched);
      } else {
        const fallback: ProfileData = {
          ...EMPTY_PROFILE,
          name:  user.name  || '',
          email: user.email || '',
        };
        setProfileData(fallback);
        setSavedData(fallback);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      const fallback: ProfileData = {
        ...EMPTY_PROFILE,
        name:  user.name  || '',
        email: user.email || '',
      };
      setProfileData(fallback);
      setSavedData(fallback);
      toast.error('Could not reach server. Showing cached info.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ─── Auth guard — waits for auth to finish loading first ─────────────────
  useEffect(() => {
    if (authLoading) return; // ← wait for localStorage rehydration to complete

    if (!isAuthenticated || user?.role !== 'patient') {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [authLoading, isAuthenticated, user, navigate, fetchProfile]);

  // ─── Save to Flask DB ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;

    if (!profileData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(profileData),
      });
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        toast.success('Profile updated successfully');
        setSavedData({ ...profileData });
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update profile — check your connection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({ ...savedData });
    setIsEditing(false);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // ─── Show spinner while auth context is still rehydrating ────────────────
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#3A86FF] animate-spin" />
        <p className="text-gray-500 font-medium text-sm">Loading your profile...</p>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and contact details</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Gradient banner */}
          <div className="bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {profileData.name || 'Your Name'}
                  </h2>
                  <p className="text-white/90">
                    {profileData.email || 'your@email.com'}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#3A86FF]" />
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#3A86FF]" />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#3A86FF]" />
                    Phone Number <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="+60 12-345 6789"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#3A86FF]" />
                    Date of Birth
                  </div>
                </label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#3A86FF]" />
                    Address
                  </div>
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="No. 1, Jalan Example, 80000 Johor Bahru"
                />
              </div>

              {/* Emergency Contact */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#3A86FF]" />
                    Emergency Contact Number
                  </div>
                </label>
                <input
                  type="tel"
                  value={profileData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="+60 12-987 6543"
                />
              </div>
            </div>

            {/* Privacy notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Privacy Notice:</strong> Your information will be shared with healthcare
                providers and administrators for appointment coordination and medical consultations.
                We take your privacy seriously and follow strict data protection guidelines.
              </p>
            </div>

            {/* Action buttons — edit mode only */}
            {isEditing && (
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#3A86FF] text-white rounded-lg hover:bg-[#2E6FD9] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info footer */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Why We Need This Information</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#3A86FF] mt-1">•</span>
                <span>Contact you about appointment confirmations and reminders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3A86FF] mt-1">•</span>
                <span>Reach you in case of emergencies or urgent health matters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3A86FF] mt-1">•</span>
                <span>Provide personalised healthcare recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3A86FF] mt-1">•</span>
                <span>Coordinate care between different healthcare providers</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Data Security</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>All data is encrypted and stored securely</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Only authorised healthcare staff can access your information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>You can update or delete your information anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>We never share your data with third parties without consent</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}