import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';

interface UserProfile {
  id: number;
  email: string;
  created_at: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get<UserProfile>('/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return profile ? (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold text-center sm:text-left">Profile</h1>
      </header>
      <main className="p-4 space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default ProfilePage;
