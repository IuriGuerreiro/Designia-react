import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../Layout/Layout';
import './SocialMediaScreen.css';

interface Comment {
  id: number;
  author: string;
  text: string;
  avatar: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

const HeartIcon = ({ isLiked, size = 14 }: { isLiked: boolean, size?: number }) => (
  <svg
    className={isLiked ? 'liked' : ''}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={isLiked ? 'var(--color-accent)' : 'none'}
    stroke={isLiked ? 'var(--color-accent)' : 'currentColor'}
    strokeWidth="2"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const PostDetailScreen = () => {
  const { postId } = useParams<{ postId: string }>();
  const [newComment, setNewComment] = useState('');

  // Mock data
  const [post, setPost] = useState({
    id: postId,
    content: `This is the full view for post ${postId}. A longer description could go here to see how it looks.`,
    author: 'Alice',
    avatar: 'A',
    image: 'https://source.unsplash.com/random/800x800?sofa',
    likes: 12,
    comments: [
      { id: 1, author: 'Bob', text: 'Great post!', avatar: 'B', timestamp: '2d', likes: 5, isLiked: true },
      { id: 2, author: 'Charlie', text: 'I agree, this looks amazing. Where did you get it?', avatar: 'C', timestamp: '1d', likes: 2, isLiked: false },
      { id: 3, author: 'Alice', text: 'From Designia, of course!', avatar: 'A', timestamp: '1d', likes: 0, isLiked: false },
      { id: 4, author: 'David', text: 'Looks fantastic!', avatar: 'D', timestamp: '1h', likes: 1, isLiked: false },
    ],
  });

  const handleCommentLike = (commentId: number) => {
    setPost(prevPost => ({
      ...prevPost,
      comments: prevPost.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
          : comment
      ),
    }));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <Layout>
      <div className="post-detail-container">
        <div className="post-detail-layout">
          <div className="post-detail-image-section">
            <img src={post.image} alt="Post" className="post-detail-image" />
          </div>
          <div className="post-detail-info-section">
            <div className="post-header">
              <div className="author-avatar">{post.avatar}</div>
              <div className="author-name">{post.author}</div>
            </div>
            <div className="comments-list">
              <div className="comment">
                <div className="comment-avatar">{post.avatar}</div>
                <div className="comment-body">
                  <div className="comment-content">
                    <span className="comment-author">{post.author}</span>
                    {post.content}
                  </div>
                  <div className="comment-meta">
                    <span>3d</span>
                  </div>
                </div>
              </div>
              {post.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-avatar">{comment.avatar}</div>
                  <div className="comment-body">
                    <div className="comment-content">
                      <span className="comment-author">{comment.author}</span>
                      {comment.text}
                    </div>
                    <div className="comment-meta">
                      <span>{comment.timestamp}</span>
                      <button className="comment-like-btn">Reply</button>
                      <div className="comment-actions">
                        <button className={`comment-like-btn ${comment.isLiked ? 'liked' : ''}`} onClick={() => handleCommentLike(comment.id)}>
                          <HeartIcon isLiked={comment.isLiked} />
                          <span>{comment.likes > 0 && comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="comment-form">
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={1}
                />
                <button type="submit" style={{ opacity: newComment ? 1 : 0.5 }}>
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetailScreen;