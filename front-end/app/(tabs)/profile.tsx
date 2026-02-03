import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODE_STORAGE_KEY = "@user_mode_host";
const READ_NOTIFS_KEY = "@read_notifications_ids";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isHostMode, setIsHostMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRevenues, setShowRevenues] = useState(false);
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(MODE_STORAGE_KEY);
        if (savedMode !== null) setIsHostMode(JSON.parse(savedMode));

        const storedRead = await AsyncStorage.getItem(READ_NOTIFS_KEY);
        const readIds = storedRead ? JSON.parse(storedRead) : [];
        setUnreadCount(Math.max(0, 2 - readIds.length));
      } catch (e) {
        console.error(e);
      }
    };
    loadAppData();
  }, []);

  const toggleMode = async (value: boolean) => {
    setIsHostMode(value);
    await AsyncStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(value));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Kouassi P.</Text>
          <Text style={styles.email}>kouassi.business@email.com</Text>
        </View>

        <View
          style={[
            styles.modeSelector,
            isHostMode ? styles.modeHostActive : styles.modeGuestActive,
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>
              {isHostMode ? "Mode Propriétaire" : "Mode Client"}
            </Text>
            <Text style={styles.modeSub}>
              {isHostMode
                ? "Gérez vos revenus et vos biens"
                : "Trouvez votre prochain séjour"}
            </Text>
          </View>
          <Switch
            value={isHostMode}
            onValueChange={toggleMode}
            trackColor={{ false: "#767577", true: "#222" }}
            thumbColor="white"
          />
        </View>

        <View style={styles.menuContainer}>
          {isHostMode ? (
            <View>
              <Text style={styles.sectionTitle}>Gestion Hôte</Text>
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.statCard}
                  onPress={() => setShowRevenues(true)}
                >
                  <Text style={styles.statNumber}>3.4M</Text>
                  <Text style={styles.statLabel}>Revenus (FCFA)</Text>
                </TouchableOpacity>

                {/* CARTE STATISTIQUE -> OUVRE LE MODAL */}
                <TouchableOpacity
                  style={styles.statCard}
                  onPress={() => setShowAds(true)}
                >
                  <Text style={styles.statNumber}>10</Text>
                  <Text style={styles.statLabel}>Annonces</Text>
                </TouchableOpacity>
              </View>

              {/* BOUTON LISTE -> RENVOIE À LA PAGE MANAGE ADS */}
              <MenuLink
                icon="list"
                title="Mes annonces"
                onPress={() => router.push("/manage-ads" as any)}
              />

              <MenuLink
                icon="calendar"
                title="Réservations reçues"
                badge="2"
                onPress={() => router.push("/manage-bookings" as any)}
              />
              <MenuLink
                icon="stats-chart"
                title="Analyses & Revenus"
                onPress={() => router.push("/analytics" as any)}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Mes Activités</Text>
              <MenuLink
                icon="heart-outline"
                title="Mes Favoris"
                onPress={() => router.push("/(tabs)/favorites" as any)}
              />
              <MenuLink
                icon="briefcase-outline"
                title="Mes Réservations"
                onPress={() => router.push("/(tabs)/bookings" as any)}
              />
              <MenuLink
                icon="notifications-outline"
                title="Notifications"
                badge={unreadCount > 0 ? unreadCount.toString() : undefined}
                onPress={() => router.push("/notifications" as any)}
              />
              <MenuLink
                icon="settings-outline"
                title="Paramètres du compte"
                onPress={() => router.push("/settings" as any)}
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL REVENUS */}
      <RevenueModal
        visible={showRevenues}
        onClose={() => setShowRevenues(false)}
      />

      {/* MODAL ANNONCES */}
      <AdsModal visible={showAds} onClose={() => setShowAds(false)} />
    </View>
  );
}

// --- MODAL REVENUS ---
const RevenueModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible)
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
  }, [visible]);

  const closeModal = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  const backdropOpacity = panY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) panY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) closeModal();
        else
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const revenues = [
    {
      id: "1",
      name: "Villa Oasis",
      guest: "Jean M.",
      price: "+85.000",
      date: "30 Janv.",
    },
    {
      id: "2",
      name: "Appart Plateau",
      guest: "Awa D.",
      price: "+45.000",
      date: "29 Janv.",
    },
    {
      id: "3",
      name: "Villa Horizon",
      guest: "Marc K.",
      price: "+120.000",
      date: "28 Janv.",
    },
    {
      id: "4",
      name: "Loft Design",
      guest: "Sarah B.",
      price: "+65.000",
      date: "27 Janv.",
    },
    {
      id: "5",
      name: "Studio Cozy",
      guest: "Paul H.",
      price: "+25.000",
      date: "25 Janv.",
    },
    {
      id: "6",
      name: "Villa Palmera",
      guest: "Alain Z.",
      price: "+95.000",
      date: "24 Janv.",
    },
    {
      id: "7",
      name: "Penthouse Chic",
      guest: "Julie L.",
      price: "+150.000",
      date: "22 Janv.",
    },
    {
      id: "8",
      name: "Villa Horizon",
      guest: "Yann F.",
      price: "+120.000",
      date: "20 Janv.",
    },
    {
      id: "9",
      name: "Duplex Moderne",
      guest: "Fatou C.",
      price: "+75.000",
      date: "18 Janv.",
    },
    {
      id: "10",
      name: "Villa Oasis",
      guest: "Boris V.",
      price: "+85.000",
      date: "15 Janv.",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.modalOverlay, { opacity: backdropOpacity }]}
      >
        <Pressable style={styles.dismissArea} onPress={closeModal} />
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY: panY }] }]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails des revenus</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color="#CCC" />
              </TouchableOpacity>
            </View>
            <View style={styles.revenueBanner}>
              <Text style={styles.revLabel}>Solde total</Text>
              <Text style={styles.revAmount}>3.450.000 FCFA</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {revenues.map((item) => (
              <View key={item.id} style={styles.transItem}>
                <View style={styles.transIcon}>
                  <Ionicons name="receipt-outline" size={20} color="#222" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.transName}>{item.name}</Text>
                  <Text style={styles.transDetail}>
                    {item.guest} • {item.date}
                  </Text>
                </View>
                <Text style={styles.transPrice}>{item.price}</Text>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// --- MODAL ANNONCES ---
const AdsModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible)
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
  }, [visible]);

  const closeModal = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  const backdropOpacity = panY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) panY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) closeModal();
        else
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const ads = [
    {
      id: "1",
      title: "Villa Horizon",
      loc: "Assinie",
      price: "120.000",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
      status: "Actif",
    },
    {
      id: "2",
      title: "Luxury Suite",
      loc: "Plateau",
      price: "45.000",
      img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
      status: "Actif",
    },
    {
      id: "3",
      title: "Villa Tahiba",
      loc: "Cocody",
      price: "150.000",
      img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
      status: "Occupé",
    },
    {
      id: "4",
      title: "Villa Palmera",
      loc: "Assinie",
      price: "95.000",
      img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400",
      status: "Actif",
    },
    {
      id: "5",
      title: "Penthouse Moderne",
      loc: "Angré",
      price: "85.000",
      img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400",
      status: "En pause",
    },
    {
      id: "6",
      title: "Villa Oasis",
      loc: "Assinie",
      price: "85.000",
      img: "https://images.unsplash.com/photo-1580587767303-941bd174d3f7?w=400",
      status: "Actif",
    },
    {
      id: "7",
      title: "Studio Design",
      loc: "Plateau",
      price: "35.000",
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
      status: "Actif",
    },
    {
      id: "8",
      title: "Loft Industriel",
      loc: "Zone 4",
      price: "60.000",
      img: "https://images.unsplash.com/photo-1536376074432-cd23f0599f63?w=400",
      status: "Actif",
    },
    {
      id: "9",
      title: "Bungalow Plage",
      loc: "Assinie",
      price: "70.000",
      img: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400",
      status: "En pause",
    },
    {
      id: "10",
      title: "Duplex Chic",
      loc: "Cocody",
      price: "110.000",
      img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400",
      status: "Actif",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.modalOverlay, { opacity: backdropOpacity }]}
      >
        <Pressable style={styles.dismissArea} onPress={closeModal} />
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY: panY }] }]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mes Annonces (10)</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color="#CCC" />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {ads.map((ad) => (
              <View key={ad.id} style={styles.adItem}>
                <Image source={{ uri: ad.img }} style={styles.adImage} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  <Text style={styles.adLoc}>
                    {ad.loc} • {ad.price} FCFA/nuit
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          ad.status === "Actif" ? "#E8F5E9" : "#F5F5F5",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: ad.status === "Actif" ? "#2E7D32" : "#757575",
                        },
                      ]}
                    >
                      {ad.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// --- COMPOSANTS DE BASE ---
const MenuLink = ({ icon, title, badge, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#222" />
    <Text style={styles.menuText}>{title}</Text>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={20} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  profileHeader: { alignItems: "center", padding: 30 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#F0F0F0",
  },
  name: { fontSize: 22, fontWeight: "bold" },
  email: { color: "#717171", marginTop: 4 },
  modeSelector: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeGuestActive: { backgroundColor: "#F7F7F7", borderColor: "#EEE" },
  modeHostActive: { backgroundColor: "#FFF8F8", borderColor: "#222" },
  modeTitle: { fontSize: 17, fontWeight: "bold" },
  modeSub: { fontSize: 13, color: "#717171", marginTop: 2 },
  menuContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#222" },
  statLabel: { fontSize: 12, color: "#717171" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16 },
  badge: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  badgeText: { color: "white", fontSize: 12, fontWeight: "bold" },
  logoutBtn: { marginVertical: 40, alignItems: "center" },
  logoutText: {
    color: "#FF5A5F",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  dismissArea: { flex: 1 },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: "85%",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  revenueBanner: {
    backgroundColor: "#222",
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  revLabel: { color: "#AAA", fontSize: 14 },
  revAmount: { color: "white", fontSize: 28, fontWeight: "bold", marginTop: 5 },
  transItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  transName: { fontSize: 15, fontWeight: "600" },
  transDetail: { fontSize: 12, color: "#717171" },
  transPrice: { fontSize: 15, fontWeight: "bold", color: "#34C759" },
  adItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  adImage: { width: 70, height: 70, borderRadius: 12 },
  adTitle: { fontSize: 16, fontWeight: "bold" },
  adLoc: { fontSize: 13, color: "#717171" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  statusText: { fontSize: 11, fontWeight: "bold" },
});
