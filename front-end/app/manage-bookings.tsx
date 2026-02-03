import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const RECEIVED_BOOKINGS = [
  {
    id: "1",
    property: "Villa Horizon",
    guest: "Jean Marc K.",
    dates: "12 - 15 Fév. 2024",
    price: "360.000 FCFA",
    avatar: "https://i.pravatar.cc/150?u=1",
    status: "En attente",
  },
  {
    id: "2",
    property: "Luxury Suite",
    guest: "Awa Diop",
    dates: "20 - 22 Fév. 2024",
    price: "90.000 FCFA",
    avatar: "https://i.pravatar.cc/150?u=5",
    status: "Confirmé",
  },
  {
    id: "3",
    property: "Villa Oasis",
    guest: "Boris V.",
    dates: "05 - 08 Mars 2024",
    price: "255.000 FCFA",
    avatar: "https://i.pravatar.cc/150?u=8",
    status: "Refusé",
  },
];

export default function ManageBookingsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = ["Tout", "En attente", "Confirmé", "Refusé"];

  // Logique combinée : Filtre + Recherche
  const filteredBookings = RECEIVED_BOOKINGS.filter((booking) => {
    const matchesFilter =
      activeFilter === "Tout" || booking.status === activeFilter;
    const matchesSearch =
      booking.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.property.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: "Réservations reçues",
          headerShadowVisible: false,
          headerBackTitle: "",
        }}
      />
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerPadding}>
        <Text style={styles.title}>Demandes de séjour</Text>
        <Text style={styles.subtitle}>Gérez les arrivées de vos clients</Text>

        {/* --- BARRE DE RECHERCHE --- */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#717171"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client ou un bien..."
            placeholderTextColor="#AAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTRES HORIZONTAUX */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterBtn,
                activeFilter === filter && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((item) => (
            <View key={item.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.guestAvatar}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.guestName}>{item.guest}</Text>
                  <Text style={styles.propertyName}>{item.property}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "En attente"
                          ? "#FF950015"
                          : item.status === "Confirmé"
                            ? "#34C75915"
                            : "#FF3B3015",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === "En attente"
                            ? "#FF9500"
                            : item.status === "Confirmé"
                              ? "#34C759"
                              : "#FF3B30",
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color="#717171" />
                  <Text style={styles.infoText}>{item.dates}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={18} color="#717171" />
                  <Text style={styles.infoText}>{item.price}</Text>
                </View>
              </View>

              {item.status === "En attente" && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.acceptText}>Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.declineText}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={50} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              Aucun résultat pour cette recherche
            </Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  headerPadding: { paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 15, color: "#717171", marginBottom: 20, marginTop: 4 },

  // Styles Recherche
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: "#1A1A1A", fontWeight: "500" },

  // Styles Filtres
  filterScroll: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F2F2F7",
  },
  filterBtnActive: { backgroundColor: "#1A1A1A" },
  filterText: { fontSize: 14, fontWeight: "600", color: "#717171" },
  filterTextActive: { color: "#FFF" },

  scrollContent: { padding: 20 },
  bookingCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  guestAvatar: { width: 48, height: 48, borderRadius: 24 },
  guestName: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  propertyName: { fontSize: 13, color: "#717171", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  cardBody: { marginVertical: 18, gap: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoText: { fontSize: 14, color: "#444", fontWeight: "500" },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    paddingTop: 18,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  acceptText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  declineBtn: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  declineText: { color: "#FF3B30", fontWeight: "700", fontSize: 15 },
  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: {
    color: "#AAA",
    marginTop: 15,
    fontSize: 15,
    textAlign: "center",
  },
});
