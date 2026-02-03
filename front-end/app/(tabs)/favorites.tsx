import React from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// Import du contexte pour récupérer les favoris
import { useFavorites } from "../../context/FavoritesContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavorites();

  // Écran si la liste est vide
  if (favorites.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Ionicons name="heart-dislike-outline" size={100} color="#F0F0F0" />
        <Text style={styles.emptyTitle}>Pas encore de coups de cœur</Text>
        <Text style={styles.emptySubtitle}>
          Cliquez sur le cœur pour ajouter des logements à votre liste de
          favoris.
        </Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => router.push("/")}
        >
          <Text style={styles.exploreBtnText}>Explorer les logements</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <Text style={styles.headerCount}>
          {favorites.length} logement(s) enregistré(s)
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        // On injecte le paddingBottom ici pour que la liste défile derrière la barre système
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // Calcul dynamique du nombre d'images comme dans index
          const imagesArray = JSON.parse(item.images);
          const firstImage = imagesArray[0];

          return (
            <TouchableOpacity
              activeOpacity={0.95}
              style={styles.card}
              onPress={() =>
                router.push({ pathname: "/details", params: item })
              }
            >
              <View>
                <Image source={{ uri: firstImage }} style={styles.cardImage} />

                {/* Badge Galerie ajouté ici */}
                <View style={styles.imageCountBadge}>
                  <Ionicons name="images-outline" size={12} color="white" />
                  <Text style={styles.imageCountText}>
                    {" "}
                    {imagesArray.length}
                  </Text>
                </View>

                {/* Bouton de suppression des favoris */}
                <TouchableOpacity
                  style={styles.heartIcon}
                  onPress={() => toggleFavorite(item)}
                >
                  <Ionicons name="heart" size={28} color="#FF5A5F" />
                </TouchableOpacity>

                {/* Badge de prix identique à l'index */}
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  <Text style={styles.perNightBadge}> /nuit</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.locRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#717171"
                      />
                      <Text style={styles.cardLocation}> {item.location}</Text>
                    </View>
                  </View>

                  {/* Note identique à l'index */}
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={16} color="#FF5A5F" />
                    <Text style={styles.ratingText}> {item.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#222" },
  headerCount: { fontSize: 14, color: "#717171", marginTop: 4 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 230 },

  imageCountBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
  },
  imageCountText: { color: "white", fontSize: 11, fontWeight: "bold" },

  priceBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "baseline",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  priceText: { fontWeight: "bold", fontSize: 14, color: "#222" },
  perNightBadge: { fontSize: 10, color: "#717171" },
  heartIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 8,
  },
  cardContent: { padding: 15 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#222" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
  ratingText: { fontSize: 15, fontWeight: "bold", color: "#222" },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardLocation: { fontSize: 14, color: "#717171" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#FFF",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#717171",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  exploreBtn: {
    marginTop: 30,
    backgroundColor: "#222",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
});
