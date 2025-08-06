import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import './UserProfileScreen.css';

interface ProfileData {
    bio?: string;
    location?: string;
    website?: string;
}

interface UserProfile {
    id: number;
    username: string;
    avatar: string | null;
    profile: ProfileData;
    date_joined: string;
}

const UserProfileScreen: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    
    // Static user data
    const staticUserProfile: UserProfile = {
        id: Number(userId),
        username: 'JaneDoe',
        avatar: 'https://source.unsplash.com/random/150x150?woman',
        profile: {
            bio: 'A passionate designer creating beautiful and functional furniture. Inspired by nature and minimalist aesthetics.',
            location: 'New York, USA',
            website: 'https://janedoe.design'
        },
        date_joined: '2023-01-15T10:00:00Z'
    };

    const [userProfile] = useState<UserProfile | null>(staticUserProfile);

    if (!userProfile) {
        return <Layout><div className="error-container">User not found.</div></Layout>;
    }

    return (
        <Layout>
            <div className="form-page-container">
                <h2>{userProfile.username}'s Profile</h2>
                <p>Member since {new Date(userProfile.date_joined).toLocaleDateString()}</p>
                
                <div className="standard-form">
                  <fieldset>
                    <legend>Profile Information</legend>
                    
                    <div className="form-group profile-picture-section">
                      <label>Profile Picture</label>
                      <img src={userProfile.avatar || '/default-avatar.png'} alt={`${userProfile.username}'s avatar`} className="profile-avatar" />
                    </div>

                    <div className="form-group">
                      <label>Username</label>
                      <input type="text" value={userProfile.username} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea value={userProfile.profile.bio} readOnly rows={5}></textarea>
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" value={userProfile.profile.location} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Website</label>
                      <input type="text" value={userProfile.profile.website} readOnly />
                    </div>
                  </fieldset>
                </div>
            </div>
        </Layout>
    );
};

export default UserProfileScreen;
