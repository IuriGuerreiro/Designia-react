import React, { useState } from 'react';
import './SocialMediaScreen.css';
import Layout from '../../components/Layout/Layout';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  content: string;
  author: string;
  authorId: number;
  avatar: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const HeartIcon = ({ isLiked }: { isLiked: boolean }) => (
  <svg
    className={isLiked ? 'liked' : ''}
    viewBox="0 0 24 24"
    fill={isLiked ? 'red' : 'none'}
    stroke={isLiked ? 'red' : 'currentColor'}
    strokeWidth="2"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const SocialMediaScreen = () => {
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, content: 'Loving the new minimalist sofa from Designia! It perfectly fits my space.', author: 'Alice', authorId: 1, avatar: 'A', image: 'https://source.unsplash.com/random/800x600?sofa', likes: 12, comments: 3, isLiked: false },
    { id: 2, content: 'Just got my new lamp. The design is amazing!', author: 'Bob', authorId: 2, avatar: 'B', likes: 5, comments: 1, isLiked: true },
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      // Update logic here
    } else {
      // Create logic here
    }
  };

  return (
    <Layout>
      <div className="social-media-screen">
        <div className="post-form">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
          />
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingPost ? 'Update Post' : 'Create Post'}
          </button>
        </div>

        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <Link to={`/users/${post.authorId}`} className="author-link">
                <div className="author-avatar">{post.avatar}</div>
                <div className="author-name">{post.author}</div>
              </Link>
            </div>
            <Link to={`/social-media/${post.id}`} className="post-content-link">
              {post.image && <img src={post.image} alt="Post" className="post-image" />}
              <div className="post-content">
                <p>{post.content}</p>
              </div>
            </Link>
            <div className="post-actions">
              <button className="action-button" onClick={(e) => { e.preventDefault(); handleLike(post.id); }}>
                <HeartIcon isLiked={post.isLiked} />
                <span>{post.likes}</span>
              </button>
              <button className="action-button" onClick={(e) => e.preventDefault()}>
                <CommentIcon />
                <span>{post.comments}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default SocialMediaScreen;
