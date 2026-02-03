import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  FlatList,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { ADS_DATA } from "./index";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const INITIAL_COORD = { latitude: 5.3484, longitude: -3.9705 };

const AD_GALLERIES: Record<string, string[]> = {
  "1": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=500",
    "https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?q=80&w=500",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=500",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?q=80&w=500",
  ],
  "2": [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=500",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=500",
    "https://images.unsplash.com/photo-1613977252422-434f9c092414?q=80&w=500",
    "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=500",
  ],
};

const FeatureItem = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={20} color="#1A1A1A" />
    </View>
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

// NOUVEAU COMPOSANT POUR LES ÉQUIPEMENTS (STYLE GRID)
const AmenityItem = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.amenityItem}>
    <View style={styles.amenityIconBox}>
      <Ionicons name={icon} size={22} color="#1A1A1A" />
    </View>
    <Text style={styles.amenityLabel}>{label}</Text>
  </View>
);

export default function AdDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const ad = useMemo(() => ADS_DATA.find((item) => item.id === id), [id]);
  const markerCoord = INITIAL_COORD;

  const galleryImages = useMemo(() => {
    if (!ad) return [];
    return AD_GALLERIES[ad.id as string] || [ad.img, ad.img, ad.img, ad.img];
  }, [ad]);

  if (!ad) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => Share.share({ message: ad.title })}
        >
          <Ionicons name="share-outline" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Image source={{ uri: ad.img }} style={styles.heroImage} />

        <View style={styles.contentCard}>
          <View style={styles.indicator} />

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{ad.title}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location-sharp" size={16} color="#FF5A5F" />
                <Text style={styles.location}>{ad.loc}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* PHOTOS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Photos du bien</Text>
            <Text style={styles.badgeText}>{galleryImages.length} images</Text>
          </View>
          <FlatList
            data={galleryImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryThumb} />
            )}
            contentContainerStyle={{ gap: 14, paddingVertical: 10 }}
          />

          <View style={styles.divider} />

          {/* CONFIGURATION */}
          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            Configuration
          </Text>
          <View style={styles.featuresGrid}>
            <FeatureItem icon="people-outline" label="4 Pers." />
            <FeatureItem icon="bed-outline" label="2 Ch." />
            <FeatureItem icon="layers-outline" label="2 Lits" />
            <FeatureItem icon="water-outline" label="1 Sdb" />
          </View>

          <View style={styles.divider} />

          {/* SECTION : CE QUE PROPOSE CE LOGEMENT */}
          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            Ce que propose ce logement
          </Text>
          <View style={styles.amenitiesGrid}>
            <AmenityItem icon="wifi-outline" label="Wifi Fibre" />
            <AmenityItem icon="car-outline" label="Parking" />
            <AmenityItem icon="snow-outline" label="Climatisation" />
            <AmenityItem icon="tv-outline" label="Netflix" />
            <AmenityItem icon="flash-outline" label="Générateur" />
            <AmenityItem icon="water-outline" label="Piscine" />
          </View>

          <View style={styles.divider} />

          {/* DESCRIPTION */}
          <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>
            Description
          </Text>
          <Text style={styles.description}>{ad.desc}</Text>

          <View style={styles.divider} />

          {/* SECTION : REGLEMENT INTERIEUR */}
          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            Règlement intérieur
          </Text>
          <View style={styles.rulesContainer}>
            <View style={styles.ruleLine}>
              <Ionicons name="time-outline" size={18} color="#717171" />
              <Text style={styles.ruleLabel}>Check-in</Text>
              <Text style={styles.ruleVal}>14h00 - 22h00</Text>
            </View>
            <View style={styles.ruleLine}>
              <Ionicons name="log-out-outline" size={18} color="#717171" />
              <Text style={styles.ruleLabel}>Check-out</Text>
              <Text style={styles.ruleVal}>12h00</Text>
            </View>
            <View style={styles.ruleLine}>
              <Ionicons name="ban-outline" size={18} color="#FF5A5F" />
              <Text style={styles.ruleLabel}>Fêtes & Soirées</Text>
              <Text style={[styles.ruleVal, { color: "#FF5A5F" }]}>
                Interdit
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            Emplacement
          </Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                ...markerCoord,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={markerCoord}>
                <View style={styles.customMarker}>
                  <Ionicons name="home" size={16} color="white" />
                </View>
              </Marker>
            </MapView>
          </View>

          <View style={styles.divider} />

          <View style={styles.footerInfoCard}>
            <View>
              <Text style={styles.footerLabel}>Tarif nuitée</Text>
              <Text style={styles.footerPrice}>{ad.price} FCFA</Text>
            </View>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>Propriétaire</Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.editMainBtn}>
              <Ionicons name="create-outline" size={20} color="#FFF" />
              <Text style={styles.editMainBtnText}>Modifier l'annonce</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteMainBtn}
              onPress={() =>
                Alert.alert(
                  "Supprimer",
                  "Voulez-vous supprimer cette annonce ?",
                )
              }
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  heroImage: { width: SCREEN_WIDTH, height: 400 },
  floatingHeader: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  roundBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  contentCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -40,
    padding: 24,
  },
  indicator: {
    width: 35,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 25,
  },
  titleRow: { marginBottom: 5 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  location: {
    fontSize: 15,
    color: "#717171",
    marginLeft: 5,
    fontWeight: "500",
  },
  divider: { height: 1, backgroundColor: "#F5F5F5", marginVertical: 25 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: "#1A1A1A" },
  badgeText: {
    fontSize: 12,
    color: "#717171",
    fontWeight: "600",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  galleryThumb: {
    width: 160,
    height: 110,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
  },
  featuresGrid: { flexDirection: "row", justifyContent: "space-between" },
  featureItem: { alignItems: "center", gap: 8, width: "22%" },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  featureLabel: { fontSize: 12, color: "#717171", fontWeight: "700" },

  // STYLES AJOUTÉS POUR ÉQUIPEMENTS
  amenitiesGrid: { flexDirection: "row", flexWrap: "wrap" },
  amenityItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  amenityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  amenityLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: "#444",
    fontWeight: "600",
  },

  // STYLES AJOUTÉS POUR RÈGLEMENT
  rulesContainer: { backgroundColor: "#F9F9F9", borderRadius: 20, padding: 20 },
  ruleLine: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ruleLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  ruleVal: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },

  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  mapContainer: {
    height: 220,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  map: { flex: 1 },
  customMarker: {
    backgroundColor: "#FF5A5F",
    padding: 8,
    borderRadius: 20,
    elevation: 5,
    borderWidth: 3,
    borderColor: "white",
  },
  footerInfoCard: {
    backgroundColor: "#F8F8F8",
    padding: 22,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  footerLabel: { fontSize: 13, color: "#717171", fontWeight: "600" },
  footerPrice: { fontSize: 24, fontWeight: "900", color: "#1A1A1A" },
  statusChip: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusChipText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  actionGrid: { flexDirection: "row", marginTop: 25, gap: 15 },
  editMainBtn: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 22,
    gap: 10,
  },
  editMainBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  deleteMainBtn: {
    width: 70,
    height: 70,
    backgroundColor: "#FF3B3010",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
});
