import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Status = "pending" | "confirmed" | "completed" | "declined";

// Correction de l'erreur TypeScript en définissant un type avec propriété optionnelle
type StatusTheme = {
  label: string;
  color: string;
  icon: string;
  cardBg: string;
  opacity?: number;
};

const STATUS_THEMES: Record<Status, StatusTheme> = {
  pending: {
    label: "En attente",
    color: "#F5A623",
    icon: "time-outline",
    cardBg: "#FFFFFF",
  },
  confirmed: {
    label: "Confirmé",
    color: "#00A699",
    icon: "checkmark-circle-outline",
    cardBg: "#F0FFF4",
  },
  completed: {
    label: "Terminé",
    color: "#717171",
    icon: "archive-outline",
    cardBg: "#FFFFFF",
    opacity: 0.7,
  },
  declined: {
    label: "Refusé",
    color: "#FF5A5F",
    icon: "close-circle-outline",
    cardBg: "#FFF9F9",
  },
};

const INITIAL_DATA = [
  {
    id: "1",
    title: "Villa Horizon - Piscine",
    location: "Assinie, CI",
    dates: "12/02/2026 — 15/02/2026",
    price: "255.000 FCFA",
    status: "pending" as Status,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    timestamp: new Date(2026, 1, 12).getTime(),
  },
  {
    id: "2",
    title: "Appartement Chic Plateau",
    location: "Abidjan, CI",
    dates: "01/01/2026 — 03/01/2026",
    price: "90.000 FCFA",
    status: "confirmed" as Status,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    timestamp: new Date(2026, 0, 1).getTime(),
  },
  {
    id: "3",
    title: "Bungalow Bord de Mer",
    location: "Grand-Bassam, CI",
    dates: "15/12/2025 — 20/12/2025",
    price: "180.000 FCFA",
    status: "completed" as Status,
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
    timestamp: new Date(2025, 11, 15).getTime(),
  },
  {
    id: "4",
    title: "Studio Moderne Cocody",
    location: "Abidjan, CI",
    dates: "10/02/2026 — 12/02/2026",
    price: "45.000 FCFA",
    status: "declined" as Status,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    timestamp: new Date(2026, 1, 10).getTime(),
  },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const theme = STATUS_THEMES[status];

  return (
    <View style={[styles.badge, { backgroundColor: theme.color + "15" }]}>
      <Ionicons name={theme.icon as any} size={14} color={theme.color} />
      <Text style={[styles.badgeText, { color: theme.color }]}>
        {theme.label}
      </Text>
    </View>
  );
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState(INITIAL_DATA);
  const [activeFilter, setActiveFilter] = useState<"all" | Status>("all");

  const handleCancelBooking = (id: string) => {
    Alert.alert(
      "Annuler la réservation",
      "Voulez-vous vraiment annuler cette demande ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: () => setBookings((prev) => prev.filter((b) => b.id !== id)),
        },
      ],
    );
  };

  const filteredAndSortedData = bookings
    .filter((item) => activeFilter === "all" || item.status === activeFilter)
    .sort((a, b) => b.timestamp - a.timestamp);

  const renderItem = ({ item }: { item: (typeof INITIAL_DATA)[0] }) => {
    const theme = STATUS_THEMES[item.status];

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.cardBg },
          theme.opacity ? { opacity: theme.opacity } : null,
        ]}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.datesText}>{item.dates}</Text>
            <StatusBadge status={item.status} />
          </View>

          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.location}>{item.location}</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.price}>{item.price}</Text>

            {item.status === "pending" && (
              <TouchableOpacity
                style={styles.inlineCancelBtn}
                onPress={() => handleCancelBooking(item.id)}
              >
                <Text style={styles.inlineCancelText}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <View style={[styles.header, { paddingTop: insets.top + 30 }]}>
        <Text style={styles.headerTitle}>Mes Réservations</Text>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {["all", "pending", "confirmed", "declined", "completed"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f as any)}
              style={[
                styles.filterTab,
                activeFilter === f && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === f && styles.filterTabTextActive,
                ]}
              >
                {f === "all" ? "Tout" : STATUS_THEMES[f as Status]?.label || f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredAndSortedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="filter-outline" size={60} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingBottom: 5 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#222" },
  filterWrapper: { marginBottom: 10 },
  filterScroll: { paddingHorizontal: 20, paddingVertical: 10 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F7F7F7",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  filterTabActive: { backgroundColor: "#222", borderColor: "#222" },
  filterTabText: { color: "#717171", fontWeight: "600", fontSize: 13 },
  filterTabTextActive: { color: "#FFF" },
  listContent: { padding: 20 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: "row",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: "hidden",
    height: 120,
  },
  image: { width: 100, height: 120 },
  cardInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datesText: { fontSize: 10, color: "#717171", fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "bold", color: "#222" },
  location: { fontSize: 12, color: "#717171" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: { fontSize: 14, fontWeight: "800" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "bold", marginLeft: 4 },
  inlineCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
  },
  inlineCancelText: { color: "white", fontSize: 11, fontWeight: "bold" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#BBB",
    marginTop: 20,
  },
});
