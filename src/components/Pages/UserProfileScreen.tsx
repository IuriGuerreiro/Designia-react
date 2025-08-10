import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import './UserProfileScreen.css';

// SVGs for tab icons
const PostsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="3" x2="9" y2="21"></line>
  </svg>
);

const FavoritesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const GroupsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const UserTabs = ({ activeTab, setActiveTab }) => (
  <div className="tabs-container">
    <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}><PostsIcon /><span>Posts</span></button>
    <button onClick={() => setActiveTab('favorites')} className={activeTab === 'favorites' ? 'active' : ''}><FavoritesIcon /><span>Favorites</span></button>
    <button onClick={() => setActiveTab('groups')} className={activeTab === 'groups' ? 'active' : ''}><GroupsIcon /><span>Groups</span></button>
  </div>
);

const UserProfileScreen = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');

  // Static user data for demonstration
  const user = {
    username: 'JaneDoe',
    profile_picture: 'https://source.unsplash.com/random/150x150?woman',
    bio: 'A passionate designer creating beautiful and functional furniture. Inspired by nature and minimalist aesthetics.',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return <div className="content-grid">Your posts will be displayed here.</div>;
      case 'favorites':
        return <div className="content-grid">Your favorite items will be displayed here.</div>;
      case 'groups':
        return <div className="content-grid">Your groups will be displayed here.</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <header className="profile-header">
          <img src={user.profile_picture || 'default-profile.png'} alt="Profile" className="profile-pic" />
          <div className="profile-info">
            <h2 className="username">@{user.username}</h2>
            <div className="profile-actions">
              <button className="edit-profile-btn">Edit Profile</button>
              <button className="settings-btn">Settings</button>
            </div>
            <div className="profile-stats">
              <div className="stat">
                <strong>123</strong>
                <span>Following</span>
              </div>
              <div className="stat">
                <strong>456K</strong>
                <span>Followers</span>
              </div>
              <div className="stat">
                <strong>7.8M</strong>
                <span>Likes</span>
              </div>
            </div>
            <div className="profile-bio">
              <p>{user.bio || 'No bio yet.'}</p>
            </div>
          </div>
        </header>

        <main className="profile-content">
          <UserTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="content-container">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
};

export default UserProfileScreen;
