import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ADS_DATA = [
  {
    id: "1",
    title: "Villa Horizon",
    loc: "Assinie, CI",
    price: "120.000",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    status: "Actif",
    desc: "Superbe villa en bordure de lagune avec piscine.",
    blockedDatesCount: 3,
  },
  {
    id: "2",
    title: "Luxury Suite",
    loc: "Plateau, Abidjan",
    price: "45.000",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    status: "Actif",
    desc: "Studio moderne au centre des affaires.",
    blockedDatesCount: 0,
  },
  {
    id: "3",
    title: "Villa Tahiba",
    loc: "Cocody, Abidjan",
    price: "150.000",
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    status: "Occupé",
    desc: "Propriété de luxe avec grand jardin.",
    blockedDatesCount: 5,
  },
  {
    id: "4",
    title: "L'Oasis Bleue",
    loc: "Grand-Bassam",
    price: "95.000",
    img: "https://images.unsplash.com/photo-1580587767303-941bd174d3f7?w=800",
    status: "En attente",
    desc: "Cadre paisible idéal pour les week-ends.",
    blockedDatesCount: 1,
  },
];

export default function ManageAdsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actif":
        return "#34C759";
      case "Occupé":
        return "#FF3B30";
      case "En attente":
        return "#FF9500";
      default:
        return "#8E8E93";
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{ title: "Mes annonces", headerShadowVisible: false }}
      />
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.createMainBtn}
          onPress={() => router.push("/add-listing" as any)}
        >
          <Ionicons name="add-circle" size={24} color="#FF5A5F" />
          <Text style={styles.createBtnTitle}>
            Publier une nouvelle annonce
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes propriétés</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{ADS_DATA.length}</Text>
          </View>
        </View>

        {/* Bandeau explicatif pour le calendrier */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#717171"
          />
          <Text style={styles.infoText}>
            L'icône <Ionicons name="calendar" size={12} color="#1A1A1A" /> est
            cliquable : elle vous permet de gérer et consulter l'historique des
            dates d'indisponibilité de vos biens.
          </Text>
        </View>

        {ADS_DATA.map((ad) => (
          <TouchableOpacity
            key={ad.id}
            style={styles.adCard}
            onPress={() =>
              router.push({
                pathname: "/manage-ads/details",
                params: { id: ad.id },
              } as any)
            }
          >
            <Image source={{ uri: ad.img }} style={styles.adImg} />
            <View style={styles.adInfo}>
              <View style={styles.topRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adTitle} numberOfLines={1}>
                    {ad.title}
                  </Text>
                  <Text style={styles.adLoc}>{ad.loc}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(ad.status) + "15" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(ad.status) },
                    ]}
                  >
                    {ad.status}
                  </Text>
                </View>
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.adPrice}>
                  {ad.price} <Text style={styles.fcfa}>FCFA</Text>
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.availabilityBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/manage-ads/availability",
                        params: { id: ad.id, title: ad.title },
                      } as any)
                    }
                  >
                    <Ionicons name="calendar" size={18} color="#1A1A1A" />
                    {ad.blockedDatesCount > 0 && (
                      <View style={styles.miniBadge}>
                        <Text style={styles.miniBadgeText}>
                          {ad.blockedDatesCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  createMainBtn: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    elevation: 2,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  createBtnTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: "#1A1A1A" },
  countBadge: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  countText: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    marginHorizontal: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#717171",
    flex: 1,
    lineHeight: 18,
  },
  adCard: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  adImg: { width: 95, height: 95, borderRadius: 14 },
  adInfo: { flex: 1, marginLeft: 16, justifyContent: "space-between" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  adTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A" },
  adLoc: { fontSize: 13, color: "#8E8E93", marginTop: 2 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  adPrice: { fontSize: 15, fontWeight: "800", color: "#1A1A1A" },
  fcfa: { fontSize: 10, color: "#8E8E93", fontWeight: "400" },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  availabilityBtn: {
    backgroundColor: "#F5F5F7",
    padding: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  miniBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  miniBadgeText: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
});
