import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/app/layout';
import styles from './UserProfileScreen.module.css';

const tabConfig = [
  { key: 'posts', labelKey: 'account.profile.tabs.posts', icon: '🪑' },
  { key: 'favorites', labelKey: 'account.profile.tabs.favorites', icon: '❤️' },
  { key: 'groups', labelKey: 'account.profile.tabs.groups', icon: '👥' },
] as const;

type TabKey = typeof tabConfig[number]['key'];

const defaultProfile = {
  username: 'JaneDoe',
  displayName: 'Jane Doe',
  avatar: 'https://source.unsplash.com/random/150x150?designer',
  title: 'Furniture Designer & Curator',
  badges: ['Top Seller', 'Sustainable Maker'],
  stats: [
    { label: 'Following', value: '123' },
    { label: 'Followers', value: '456K' },
    { label: 'Likes', value: '7.8M' },
  ],
  bio: 'A passionate designer creating beautiful and functional furniture. Inspired by nature and minimalist aesthetics.',
};

const UserProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  const profile = useMemo(() => ({
    ...defaultProfile,
    username: userId ? `designer_${userId}` : defaultProfile.username,
  }), [userId]);

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className={styles.gridPlaceholder}>
            <div className={styles.placeholderCard}>{t('account.profile.placeholders.posts_1')}</div>
            <div className={styles.placeholderCard}>{t('account.profile.placeholders.posts_2')}</div>
            <div className={styles.placeholderCard}>{t('account.profile.placeholders.posts_3')}</div>
          </div>
        );
      case 'favorites':
        return (
          <div className={styles.gridPlaceholder}>
            <div className={styles.placeholderCard}>{t('account.profile.placeholders.fav_1')}</div>
            <div className={styles.placeholderCard}>{t('account.profile.placeholders.fav_2')}</div>
          </div>
        );
      case 'groups':
        return (
          <div className={styles.gridPlaceholder}>
            <div className={styles.placeholderCard}>{t('account.profile.placeholders.groups_1')}</div>
            <div className={styles.placeholderCard}>{t('account.profile.placeholders.groups_2')}</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <section className={styles.profilePage}>
        <div className={styles.profileHero}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarBlock}>
              <img src={profile.avatar} alt={`${profile.displayName} avatar`} className={styles.avatar} />

              <div className={styles.meta}>
                <h1 className={styles.name}>{profile.displayName}</h1>
                <p className={styles.username}>@{profile.username}</p>
                <p className={styles.title}>{profile.title}</p>
                <div className={styles.badgeRow}>
                  {profile.badges.map((badge) => (
                    <span key={badge} className={styles.badge}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.actionButton} onClick={() => navigate('/profile/edit')}>
                {t('account.profile.actions.edit_profile')}
              </button>
              <button className={`${styles.actionButton} ${styles.actionButtonPrimary}`} onClick={() => navigate('/settings')}>
                {t('account.profile.actions.account_settings')}
              </button>
            </div>
          </div>

          <div className={styles.stats}>
            {profile.stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>{stat.value}</div>
              </div>
            ))}
          </div>

          <p className={styles.bio}>{profile.bio}</p>

          <div className={styles.tabs}>
            {tabConfig.map(({ key, labelKey, icon }) => (
              <button
                key={key}
                type="button"
                className={`${styles.tabButton} ${activeTab === key ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(key)}
              >
                <span className={styles.tabIcon} aria-hidden>
                  {icon}
                </span>
                <span className={styles.tabLabel}>{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.content}>{renderContent()}</div>
      </section>
    </Layout>
  );
};

export default UserProfileScreen;
