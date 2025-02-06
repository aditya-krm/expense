import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../styles/theme";

import useAuth from "../context/GlobalProvider";
import useTransactions from "../context/TransactionContext";

const { width } = Dimensions.get("window");

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    currency: string;
  };
  stats: {
    totalTransactions: number;
    totalSaved: number;
    averageMonthlyExpense: number;
  };
}

const Profile = () => {
  const { user, logout } = useAuth();
  const { statistics, refreshTransactions } = useTransactions();
  const [userData, setUserData] = useState<User | any>(user);
  const [refreshing, setRefreshing] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    refreshTransactions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setRefreshing(false);
    }
  }, [refreshTransactions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StatCard = ({
    title,
    value,
  }: {
    title: string;
    value: string | number;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const ProfileCard = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string;
  }) => (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[theme.colors.glass, "rgba(255,255,255,0.05)"]}
        style={styles.card}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={theme.colors.highlight}
          style={styles.cardIcon}
        />
        <View>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardValue}>{value}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const PreferenceToggle = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: boolean;
  }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceLeft}>
        <Ionicons name={icon as any} size={20} color={theme.colors.highlight} />
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <View style={[styles.toggleButton, value ? styles.toggleActive : {}]}>
        <View
          style={[styles.toggleCircle, value ? styles.toggleCircleActive : {}]}
        />
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={[theme.colors.background, "#1a0033"]}
        style={styles.gradientBg}
      >
        <View style={styles.profileHeader}>
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.highlight, "#00ccff"]}
              style={styles.avatarBorder}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userData?.name[0]}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
          <Text style={styles.name}>{userData?.name}</Text>
          <Text style={styles.profession}>{userData?.profession}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Balance" value={statistics?.netBalance ?? 0} />
          <StatCard title="Total Income" value={statistics?.totalIncome ?? 0} />
          <StatCard title="Total Expense" value={statistics?.totalExpense ?? 0} />
          <StatCard title="Net Credit" value={(statistics?.totalCreditReceived ?? 0) - (statistics?.totalCreditGiven ?? 0)} />
          <StatCard title="Credit Given" value={statistics?.totalCreditGiven ?? 0} />
          <StatCard title="Credit Received" value={statistics?.totalCreditReceived ?? 0} />
        </View>

        <View style={styles.sectionTitle}>
          <Ionicons
            name="person-circle-outline"
            size={24}
            color={theme.colors.highlight}
          />
          <Text style={styles.sectionTitleText}>Profile Information</Text>
        </View>

        <View style={styles.detailsContainer}>
          <ProfileCard icon="mail" label="Email" value={userData?.email} />
          <ProfileCard icon="call" label="Phone" value={userData?.phone} />
          <ProfileCard
            icon="calendar"
            label="Member Since"
            value={formatDate(userData?.createdAt)}
          />
        </View>

        <View style={styles.sectionTitle}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={theme.colors.highlight}
          />
          <Text style={styles.sectionTitleText}>Preferences</Text>
        </View>

        <View style={styles.preferencesContainer}>
          <PreferenceToggle
            icon="notifications-outline"
            label="Notifications"
            value={false}
          />
          <PreferenceToggle
            icon="moon-outline"
            label="Dark Mode"
            value={true}
          />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Ionicons
                name="cash-outline"
                size={20}
                color={theme.colors.highlight}
              />
              <Text style={styles.preferenceLabel}>Currency</Text>
            </View>
            <Text style={styles.preferenceValue}>{"INR"}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Text style={{ color: theme.colors.secondary, fontSize: 12, alignSelf: "center" }}>
            Made by Aditya with ❤️
          </Text>
          <TouchableOpacity style={styles.editButton}>
            <LinearGradient
              colors={[theme.colors.highlight, "#00ccff"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <LinearGradient
              colors={[theme.colors.error, "#ff4d4d"]}
              style={styles.buttonGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Log Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradientBg: {
    padding: 20,
    minHeight: "100%",
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "95%",
    height: "95%",
    borderRadius: 57,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 5,
  },
  profession: {
    fontSize: 16,
    color: theme.colors.secondary,
    textTransform: "capitalize",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statCard: {
    backgroundColor: theme.colors.glass,
    padding: 15,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    width: width * 0.27,
  },
  statValue: {
    color: theme.colors.highlight,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statTitle: {
    color: theme.colors.secondary,
    fontSize: 12,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  sectionTitleText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  detailsContainer: {
    marginTop: 10,
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardIcon: {
    marginRight: 15,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.secondary,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  preferencesContainer: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.medium,
    padding: 5,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  preferenceLabel: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  preferenceValue: {
    color: theme.colors.highlight,
    fontSize: 16,
  },
  toggleButton: {
    width: 50,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.highlight,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },
  editButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  logoutButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
