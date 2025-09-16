export type TabKey = 'games' | 'venues' | 'profile' | 'settings' | 'notifications';

export type TabItem = {
  key: TabKey;
  label: string;
  icon: string; // emoji or icon class
  disabled?: boolean;
};

export type TabBarProps = {
  items: TabItem[];
  activeKey: TabKey;
  onChange: (key: TabKey) => void;
  compact?: boolean;
  unreadCount?: number; // for notifications
  profileCompletion?: number; // 0-100
  offline?: boolean;
};

