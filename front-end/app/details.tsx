import React, { useState, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Modal,
  Animated,
  Linking,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "../context/favorites-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Configuration du calendrier en français
LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = "fr";

const { width } = Dimensions.get("window");

const AmenityItem = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.amenityItem}>
    <Ionicons name={icon} size={24} color="#222" />
    <Text style={styles.amenityLabel}>{label}</Text>
  </View>
);

// Nouveau composant pour la configuration (identique à la page manage-ads)
const FeatureItem = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={20} color="#1A1A1A" />
    </View>
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

export default function DetailsScreen() {
  const item = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [activeImage, setActiveImage] = useState(0);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [dateError, setDateError] = useState(false);

  const [selectedStartDate, setSelectedStartDate] = useState(
    (item.startDate as string) || "",
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    (item.endDate as string) || "",
  );

  const popupAnim = useRef(new Animated.Value(-200)).current;
  const latitude = parseFloat(item.latitude as string) || 5.3484;
  const longitude = parseFloat(item.longitude as string) || -3.9705;

  const images = useMemo(() => {
    try {
      return JSON.parse(
        Array.isArray(item.images) ? item.images[0] : item.images || "[]",
      );
    } catch (e) {
      return [];
    }
  }, [item.images]);

  const locationStr = Array.isArray(item.location)
    ? item.location[0]
    : item.location;

  const onShare = async () => {
    try {
      const appLink = "https://votre-app.com/download";
      const imageUrl = images[0] || "";
      const message = `🔥 Regarde cette pépite !\n\n🏡 ${item.title}\n📍 ${locationStr}\n💰 ${item.price}/nuit\n\n📸 Photo : ${imageUrl}\n\n👉 Réserve ici : ${appLink}`;
      await Share.share({
        message,
        url: imageUrl,
        title: `Villa : ${item.title}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const triggerSuccessPopup = () => {
    Animated.spring(popupAnim, {
      toValue: insets.top + 10,
      useNativeDriver: true,
      damping: 15,
    }).start();
    setTimeout(() => {
      Animated.timing(popupAnim, {
        toValue: -200,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 3500);
  };

  const { diffDays, totalPrice, displayStart, displayEnd } = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate)
      return {
        diffDays: 0,
        totalPrice: "0",
        displayStart: "Non définie",
        displayEnd: "Non définie",
      };
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const days = Math.ceil(
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const pricePerNight = Number((item.price as string).replace(/[^0-9]/g, ""));
    return {
      diffDays: days,
      totalPrice: (days * pricePerNight).toLocaleString("fr-FR"),
      displayStart: selectedStartDate.split("-").reverse().join("/"),
      displayEnd: selectedEndDate.split("-").reverse().join("/"),
    };
  }, [selectedStartDate, selectedEndDate, item.price]);

  const onDayPress = (day: any) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(day.dateString);
      setSelectedEndDate("");
      setDateError(false);
    } else {
      if (day.dateString < selectedStartDate)
        setSelectedStartDate(day.dateString);
      else setSelectedEndDate(day.dateString);
    }
  };

  const liked = isFavorite(item.id as string);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* POPUP DE SUCCÈS */}
      <Animated.View
        style={[
          styles.popupContainer,
          { transform: [{ translateY: popupAnim }] },
        ]}
      >
        <View style={styles.popupContent}>
          <View style={styles.popupIconCircle}>
            <Ionicons name="checkmark" size={20} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.popupTitle}>Réservation envoyée !</Text>
            <Text style={styles.popupSub}>
              L'hôte vous répondra très bientôt.
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* CARROUSEL IMAGES */}
        <View style={styles.imageWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            onMomentumScrollEnd={(e) =>
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
            }
          >
            {images.map((img: string, index: number) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.fullImage}
              />
            ))}
          </ScrollView>
          <View style={styles.imageCounter}>
            <Text style={styles.counterText}>
              {activeImage + 1} / {images.length}
            </Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          {/* HEADER INFOS */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titleText}>{item.title}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location" size={16} color="#FF5A5F" />
                <Text style={styles.locationText}> {locationStr}</Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FF5A5F" />
              <Text style={styles.ratingValue}> {item.rating}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* NOUVELLE SECTION : CONFIGURATION */}
          <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
            Configuration
          </Text>
          <View style={styles.featuresGrid}>
            <FeatureItem
              icon="people-outline"
              label={`${item.guests || "4"} Pers.`}
            />
            <FeatureItem
              icon="bed-outline"
              label={`${item.bedrooms || "2"} Ch.`}
            />
            <FeatureItem
              icon="layers-outline"
              label={`${item.beds || "2"} Lits`}
            />
            <FeatureItem
              icon="water-outline"
              label={`${item.bathrooms || "1"} Sdb`}
            />
          </View>

          <View style={styles.divider} />

          {/* NOUVELLE SECTION : DESCRIPTION */}
          <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>
            Description
          </Text>
          <Text style={styles.descriptionText}>
            {item.description ||
              "Profitez de ce logement exceptionnel offrant tout le confort nécessaire pour un séjour inoubliable."}
          </Text>

          <View style={styles.divider} />

          {/* ÉQUIPEMENTS */}
          <Text style={styles.sectionTitle}>Ce que propose ce logement</Text>
          <View style={styles.amenitiesGrid}>
            <AmenityItem icon="wifi-outline" label="Wifi rapide" />
            <AmenityItem icon="car-outline" label="Parking gratuit" />
            <AmenityItem icon="snow-outline" label="Climatisation" />
            <AmenityItem icon="tv-outline" label="Smart TV" />
          </View>

          <View style={styles.divider} />

          {/* CARTE */}
          <View style={styles.mapSectionHeader}>
            <Text style={styles.sectionTitle}>Emplacement</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `http://maps.google.com/?q=${latitude},${longitude}`,
                )
              }
            >
              <Text style={styles.itineraryLink}>Itinéraire</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mapSub}>{locationStr}</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
            >
              <Marker coordinate={{ latitude, longitude }}>
                <View style={styles.customMarker}>
                  <Ionicons name="home" size={18} color="white" />
                </View>
              </Marker>
            </MapView>
          </View>

          <View style={styles.divider} />

          {/* HÔTE */}
          <View style={styles.hostSection}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400",
              }}
              style={styles.hostAvatar}
            />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.hostName}>Hébergé par Kouassi P.</Text>
              <Text style={styles.hostMeta}>
                Membre depuis 2022 • ★ 4.9 avis
              </Text>
            </View>
            <TouchableOpacity style={styles.contactIconBtn}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color="#222"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* AVIS */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            <TouchableOpacity>
              <Text style={styles.itineraryLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reviewsScroll}
          >
            {[1, 2].map((i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <Image
                    source={{ uri: `https://i.pravatar.cc/150?u=${i + 10}` }}
                    style={styles.reviewAvatar}
                  />
                  <View>
                    <Text style={styles.reviewUserName}>
                      {i === 1 ? "Awa B." : "Jean-Philippe"}
                    </Text>
                    <Text style={styles.reviewDate}>Il y a 1 semaine</Text>
                  </View>
                </View>
                <Text style={styles.reviewText} numberOfLines={3}>
                  {i === 1
                    ? "L'appartement est vraiment magnifique et très bien situé."
                    : "Superbe villa pour le week-end. Kouassi est très sympa."}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* RÈGLEMENT INTÉRIEUR */}
          <Text style={styles.sectionTitle}>Règlement intérieur</Text>
          <View style={styles.ruleItem}>
            <Ionicons name="time-outline" size={20} color="#444" />
            <Text style={styles.ruleText}>Arrivée : 14:00 - 20:00</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="exit-outline" size={20} color="#444" />
            <Text style={styles.ruleText}>Départ avant 12:00</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="people-outline" size={20} color="#444" />
            <Text style={styles.ruleText}>Max. 4 voyageurs</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="wine-outline" size={20} color="#444" />
            <Text style={styles.ruleText}>Pas de fêtes ni d'alcool</Text>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* FOOTER & HEADER (Garder tels quels) */}
      <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[styles.roundBtn, { marginRight: 12 }]}
            onPress={onShare}
          >
            <Ionicons name="share-outline" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={() => toggleFavorite(item)}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#FF5A5F" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 15 }]}>
        <View>
          <Text style={styles.priceValue}>{item.price}</Text>
          <Text style={styles.priceSub}>par nuit</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => setShowSummaryModal(true)}
        >
          <Text style={styles.bookBtnText}>Réserver</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL (Garder tel quel) */}
      <Modal
        visible={showSummaryModal}
        transparent
        statusBarTranslucent
        animationType="fade"
      >
        <View style={styles.successOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowSummaryModal(false)}
          />
          <View style={styles.successCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ width: "100%" }}
              contentContainerStyle={{ alignItems: "center" }}
            >
              <View style={styles.checkCircle}>
                <Ionicons name="receipt-outline" size={30} color="white" />
              </View>
              <Text style={styles.successTitle}>Détails du séjour</Text>
              <View style={styles.summaryBox}>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Dates</Text>
                  <Text style={styles.summaryValue}>
                    {displayStart} — {displayEnd}
                  </Text>
                </View>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryLabel}>Nombre de nuits</Text>
                  <Text style={[styles.summaryValue, { color: "#FF5A5F" }]}>
                    {diffDays} nuits
                  </Text>
                </View>
              </View>
              <View style={styles.calendarWrapper}>
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={{
                    [selectedStartDate]: { selected: true, color: "#FF5A5F" },
                    [selectedEndDate]: { selected: true, color: "#FF5A5F" },
                  }}
                />
              </View>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setShowSummaryModal(false);
                  setTimeout(triggerSuccessPopup, 500);
                }}
              >
                <Text style={styles.doneBtnText}>Confirmer la réservation</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  imageWrapper: { width: width, height: 400 },
  fullImage: { width: width, height: 400, resizeMode: "cover" },
  floatingHeader: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  imageCounter: {
    position: "absolute",
    bottom: 55,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  counterText: { color: "white", fontSize: 12, fontWeight: "bold" },
  contentCard: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "white",
    padding: 25,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleText: { fontSize: 24, fontWeight: "bold", color: "#222" },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  locationText: { fontSize: 16, color: "#717171" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingValue: { fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },

  // NOUVEAUX STYLES POUR CONFIGURATION (GRID)
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

  // STYLE POUR DESCRIPTION
  descriptionText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  amenityItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  amenityLabel: { marginLeft: 10, fontSize: 15, color: "#444" },
  mapSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  itineraryLink: { color: "#FF5A5F", fontWeight: "bold", fontSize: 14 },
  mapSub: { color: "#717171", fontSize: 14, marginBottom: 15 },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
  },
  map: { flex: 1 },
  customMarker: {
    backgroundColor: "#FF5A5F",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  hostSection: { flexDirection: "row", alignItems: "center" },
  hostAvatar: { width: 54, height: 54, borderRadius: 27 },
  hostName: { fontSize: 17, fontWeight: "bold", color: "#222" },
  hostMeta: { fontSize: 13, color: "#717171", marginTop: 2 },
  contactIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewsScroll: { marginLeft: -5 },
  reviewCard: {
    width: width * 0.7,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
  },
  reviewUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  reviewUserName: { fontSize: 14, fontWeight: "bold" },
  reviewDate: { fontSize: 12, color: "#AAA" },
  reviewText: { fontSize: 13, color: "#444", lineHeight: 18 },
  ruleItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ruleText: { marginLeft: 12, fontSize: 15, color: "#444" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: width,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "white",
  },
  priceValue: { fontSize: 20, fontWeight: "bold" },
  priceSub: { fontSize: 14, color: "#717171" },
  bookBtn: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 15,
  },
  bookBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successCard: {
    backgroundColor: "white",
    width: "95%",
    maxHeight: "90%",
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  successTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    color: "#FF5A5F",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 13,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  },
  calendarWrapper: {
    width: "100%",
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: { color: "#717171", fontSize: 14 },
  summaryValue: { fontWeight: "700", color: "#222" },
  innerDivider: { height: 1, backgroundColor: "#EAEAEA", marginVertical: 10 },
  doneBtn: {
    backgroundColor: "#FF5A5F",
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  doneBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  popupContainer: { position: "absolute", left: 20, right: 20, zIndex: 999 },
  popupContent: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
  },
  popupIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00A699",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  popupTitle: { color: "white", fontWeight: "bold", fontSize: 15 },
  popupSub: { color: "#BBB", fontSize: 12, marginTop: 2 },
});
