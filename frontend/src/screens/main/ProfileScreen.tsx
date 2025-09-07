import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DECORATIVE } from '../../constants/theme';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme, locale } = useTheme();
  
  const userProfile = {
    name: 'Ram Sharma',
    username: '@ram_sharma',
    nationality: '🇳🇵',
    bio: locale === 'nepal' 
      ? 'खेलकुद प्रेमी। फुटबल र क्रिकेटमा रुचि।' 
      : 'Sports enthusiast. Love football and cricket.',
    stats: {
      wins: 15,
      draws: 3,
      losses: 2,
      winRate: 75,
      gamesPlayed: 20,
      hoursPlayed: 45,
    },
    sportsProfiles: [
      {
        id: '1',
        sport: 'Football',
        skillLevel: 'Intermediate',
        positions: ['Midfielder', 'Forward'],
        experience: '5 years',
        achievements: ['Local tournament winner 2023'],
        color: '#10B981',
      },
      {
        id: '2',
        sport: 'Cricket',
        skillLevel: 'Advanced',
        positions: ['Batsman', 'Wicket Keeper'],
        experience: '8 years',
        achievements: ['Best player of the month - July 2023'],
        color: '#3B82F6',
      },
    ],
    achievements: [
      { id: '1', name: 'First Game', icon: '🎯', unlocked: true },
      { id: '2', name: '10 Games', icon: '⚽', unlocked: true },
      { id: '3', name: 'Team Player', icon: '🤝', unlocked: true },
      { id: '4', name: 'Winner', icon: '🏆', unlocked: false },
      { id: '5', name: 'Legend', icon: '👑', unlocked: false },
    ],
  };

  const gradientColors = locale === 'nepal' 
    ? DECORATIVE.GRADIENTS.NEPAL_SUNSET
    : DECORATIVE.GRADIENTS.GLOBAL_OCEAN;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.headerContent}>
            {/* Settings Button */}
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>

            {/* Avatar with Mandala Frame */}
            <View style={styles.avatarContainer}>
              <View style={styles.mandalaFrame}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/80x80.png?text=👤' }}
                  style={styles.avatar}
                />
              </View>
              {/* Notification Halo */}
              <View style={styles.notificationHalo} />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userProfile.name} {userProfile.nationality}
              </Text>
              <Text style={styles.userHandle}>{userProfile.username}</Text>
              <Text style={styles.userBio}>{userProfile.bio}</Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editButtonText}>
                {locale === 'nepal' ? 'प्रोफाइल सम्पादन गर्नुहोस्' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </div>

        {/* Stats Section */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.statNumber}>{userProfile.stats.wins}</Text>
              <Text style={styles.statLabel}>
                {locale === 'nepal' ? 'जित' : 'Wins'}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.statNumber}>{userProfile.stats.draws}</Text>
              <Text style={styles.statLabel}>
                {locale === 'nepal' ? 'बराबरी' : 'Draws'}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.statNumber}>{userProfile.stats.losses}</Text>
              <Text style={styles.statLabel}>
                {locale === 'nepal' ? 'हार' : 'Losses'}
              </Text>
            </View>
          </View>

          <View style={styles.additionalStats}>
            <View style={styles.winRateContainer}>
              <View style={[styles.winRateCircle, { borderColor: theme.colors.success }]}>
                <Text style={[styles.winRateText, { color: theme.colors.text }]}>
                  {userProfile.stats.winRate}%
                </Text>
              </View>
              <Text style={[styles.winRateLabel, { color: theme.colors.textSecondary }]}>
                {locale === 'nepal' ? 'जीत दर' : 'Win Rate'}
              </Text>
            </View>

            <View style={styles.extraStats}>
              <View style={styles.statRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.statText, { color: theme.colors.text }]}>
                  {userProfile.stats.gamesPlayed} {locale === 'nepal' ? 'खेलहरू' : 'games'}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.statText, { color: theme.colors.text }]}>
                  {userProfile.stats.hoursPlayed} {locale === 'nepal' ? 'घण्टा' : 'hours'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sports Profiles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {locale === 'nepal' ? 'खेलकुद प्रोफाइलहरू' : 'Sports Profiles'}
          </Text>
          
          {userProfile.sportsProfiles.map((sport) => (
            <View 
              key={sport.id} 
              style={[styles.sportCard, { backgroundColor: theme.colors.card }]}
            >
              <View style={styles.sportCardHeader}>
                <View style={[styles.sportIcon, { backgroundColor: `${sport.color}20` }]}>
                  <Ionicons name="football" size={24} color={sport.color} />
                </View>
                <View style={styles.sportInfo}>
                  <Text style={[styles.sportName, { color: theme.colors.text }]}>
                    {sport.sport}
                  </Text>
                  <Text style={[styles.sportLevel, { color: theme.colors.textSecondary }]}>
                    {sport.skillLevel} • {sport.experience}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.positions}>
                {sport.positions.map((position, index) => (
                  <View key={index} style={[styles.positionChip, { backgroundColor: `${sport.color}20` }]}>
                    <Text style={[styles.positionText, { color: sport.color }]}>
                      {position}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addSportButton}>
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.addSportText, { color: theme.colors.primary }]}>
              {locale === 'nepal' ? 'खेल थप्नुहोस्' : 'Add Sport'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {locale === 'nepal' ? 'उपलब्धिहरू' : 'Achievements'}
          </Text>
          
          <View style={styles.achievementsGrid}>
            {userProfile.achievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  {
                    backgroundColor: achievement.unlocked 
                      ? theme.colors.card 
                      : `${theme.colors.textSecondary}20`,
                    opacity: achievement.unlocked ? 1 : 0.5,
                  },
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text 
                  style={[
                    styles.achievementName, 
                    { color: achievement.unlocked ? theme.colors.text : theme.colors.textSecondary }
                  ]}
                >
                  {achievement.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 280,
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  mandalaFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  notificationHalo: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userInfo: {
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  additionalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  winRateContainer: {
    alignItems: 'center',
    gap: 8,
  },
  winRateCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winRateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  winRateLabel: {
    fontSize: 12,
  },
  extraStats: {
    flex: 1,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sportCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  sportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportInfo: {
    flex: 1,
    gap: 2,
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sportLevel: {
    fontSize: 14,
  },
  positions: {
    flexDirection: 'row',
    gap: 8,
  },
  positionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addSportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#DC143C',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  addSportText: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProfileScreen;