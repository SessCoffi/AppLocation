import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  PanResponder,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarList, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFavorites } from "../../context/FavoritesContext";
import { Slider } from "@miblanchard/react-native-slider";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

// --- CONFIGURATION CALENDRIER ---
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
const TODAY = new Date().toISOString().split("T")[0];

const CATEGORIES = [
  { id: "all", name: "Tout", icon: "apps-outline" },
  { id: "villa", name: "Villas", icon: "home-outline" },
  { id: "pool", name: "Piscines", icon: "water-outline" },
  { id: "beach", name: "Plages", icon: "umbrella-outline" },
  { id: "apartment", name: "Apparts", icon: "business-outline" },
];

// --- COMPOSANTS DE RENDU ---

const PropertyCard = React.memo(({ item, onPress }: any) => {
  const images = useMemo(() => JSON.parse(item.images), [item.images]);
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View>
        <Image source={{ uri: images[0] }} style={styles.cardImage} />
        <View style={styles.imageCountBadge}>
          <Ionicons name="images-outline" size={12} color="white" />
          <Text style={styles.imageCountText}> {images.length}</Text>
        </View>
        <FavoriteButton item={item} />
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
              <Ionicons name="location-outline" size={14} color="#717171" />
              <Text style={styles.cardLocation}> {item.location}</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FF5A5F" />
            <Text style={styles.ratingText}> {item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const FavoriteButton = ({ item }: { item: any }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(item.id);
  return (
    <TouchableOpacity
      style={styles.heartIcon}
      onPress={(e) => {
        e.stopPropagation();
        toggleFavorite(item);
      }}
    >
      <Ionicons
        name={liked ? "heart" : "heart-outline"}
        size={28}
        color={liked ? "#FF5A5F" : "white"}
      />
    </TouchableOpacity>
  );
};

const SkeletonCard = () => (
  <View style={styles.card}>
    <View style={styles.skeletonImage} />
    <View style={styles.cardContent}>
      <View style={styles.skeletonTextLineLarge} />
      <View style={styles.skeletonTextLineSmall} />
    </View>
  </View>
);

// --- ECRAN PRINCIPAL ---

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [range, setRange] = useState<{ start?: string; end?: string }>({});
  const [tempRange, setTempRange] = useState<{ start?: string; end?: string }>(
    {},
  );
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [rooms, setRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateYFilter = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const backdropOpacityCalendar = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.4],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const backdropOpacityFilter = translateYFilter.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.4],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) closeCalendar();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
      },
    }),
  ).current;

  const panResponderFilter = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateYFilter.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) closeFilters();
        else
          Animated.spring(translateYFilter, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
      },
    }),
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProperties([
        {
          id: "1",
          category: "pool",
          title: "Villa Horizon - Piscine Infinity",
          location: "Assinie-Mafia, CI",
          price: "85.000 FCFA",
          rating: "4.8",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
          ]),
        },
        {
          id: "2",
          category: "apartment",
          title: "Luxury Suite - Plateau Business",
          location: "Plateau, Abidjan",
          price: "45.000 FCFA",
          rating: "4.5",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
          ]),
        },
        {
          id: "3",
          category: "villa",
          title: "Villa Tahiba - Cocody Prestige",
          location: "Cocody, Abidjan",
          price: "120.000 FCFA",
          rating: "4.9",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
          ]),
        },
        {
          id: "4",
          category: "beach",
          title: "Villa Palmera - Front de Mer",
          location: "Assinie-Mafia, CI",
          price: "95.000 FCFA",
          rating: "4.9",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
          ]),
        },
        {
          id: "5",
          category: "apartment",
          title: "Penthouse Moderne - 9ème Tranche",
          location: "Angré, Abidjan",
          price: "55.000 FCFA",
          rating: "4.5",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
          ]),
        },
      ]);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const openCalendar = () => {
    setShowCalendar(true);
    translateY.setValue(0);
  };
  const closeCalendar = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowCalendar(false));
  };

  const openFilters = () => {
    setShowFilters(true);
    translateYFilter.setValue(0);
  };
  const closeFilters = () => {
    Animated.timing(translateYFilter, {
      toValue: SCREEN_HEIGHT,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowFilters(false));
  };

  const onDayPress = (day: any) => {
    setTempRange((prev) => {
      if (!prev.start || (prev.start && prev.end))
        return { start: day.dateString, end: undefined };
      if (day.dateString > prev.start) return { ...prev, end: day.dateString };
      return { start: day.dateString, end: undefined };
    });
  };

  const markedDates = useMemo(() => {
    let marked: any = {};
    if (!tempRange.start) return marked;
    marked[tempRange.start] = {
      startingDay: true,
      color: "#FF5A5F",
      textColor: "white",
    };
    if (tempRange.end) {
      marked[tempRange.end] = {
        endingDay: true,
        color: "#FF5A5F",
        textColor: "white",
      };
      let start = new Date(tempRange.start);
      let end = new Date(tempRange.end);
      let current = new Date(start);
      current.setDate(current.getDate() + 1);
      while (current < end) {
        marked[current.toISOString().split("T")[0]] = {
          color: "#FF5A5F33",
          textColor: "#FF5A5F",
        };
        current.setDate(current.getDate() + 1);
      }
    }
    return marked;
  }, [tempRange]);

  const displayDate = useMemo(() => {
    if (!range.start) return "Choisir vos dates";
    const f = (s: any) => s.split("-").reverse().join("/");
    return range.end
      ? `${f(range.start)} — ${f(range.end)}`
      : `Dès le ${f(range.start)}`;
  }, [range]);

  const filteredProperties = useMemo(() => {
    let data = properties;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query),
      );
    }
    if (selectedCategory !== "all")
      data = data.filter((item) => item.category === selectedCategory);
    return data;
  }, [searchQuery, properties, selectedCategory]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#717171"
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Où allez-vous ?"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={openFilters}
          >
            <Ionicons name="options-outline" size={22} color="#222" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.dateButton} onPress={openCalendar}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.dateButtonText}>{displayDate}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catItem,
                selectedCategory === cat.id && styles.catItemActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={selectedCategory === cat.id ? "#222" : "#717171"}
              />
              <Text
                style={[
                  styles.catText,
                  selectedCategory === cat.id && styles.catTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!range.end ? (
        <View
          style={[
            styles.emptyStateContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={styles.emptyStateCircle}>
            <Ionicons name="calendar" size={50} color="#FF5A5F" />
          </View>
          <Text style={styles.emptyStateTitle}>Planifiez votre séjour</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={openCalendar}
          >
            <Text style={styles.emptyStateButtonText}>Choisir des dates</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={isLoading ? Array.from({ length: 4 }) : filteredProperties}
          keyExtractor={(item, index) => (isLoading ? `s-${index}` : item.id)}
          renderItem={({ item }) =>
            isLoading ? (
              <SkeletonCard />
            ) : (
              <PropertyCard
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/details",
                    params: {
                      ...item,
                      startDate: range.start,
                      endDate: range.end,
                    },
                  })
                }
              />
            )
          }
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* MODAL CALENDRIER */}
      <Modal
        visible={showCalendar}
        transparent
        statusBarTranslucent
        animationType="none"
      >
        <Animated.View
          style={[styles.modalOverlay, { opacity: backdropOpacityCalendar }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeCalendar} />
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY }],
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            <View {...panResponder.panHandlers}>
              <View style={styles.dragHandle} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Dates de séjour</Text>
                <TouchableOpacity onPress={closeCalendar}>
                  <Ionicons name="close-circle" size={28} color="#CCC" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 360 }}>
              <CalendarList
                horizontal
                pagingEnabled
                calendarWidth={SCREEN_WIDTH - 50}
                pastScrollRange={0}
                futureScrollRange={12}
                onDayPress={onDayPress}
                markingType={"period"}
                markedDates={markedDates}
                theme={{ todayTextColor: "#FF5A5F" } as any}
                minDate={TODAY}
              />
            </View>
            <View style={styles.footerActions}>
              <TouchableOpacity
                onPress={() => {
                  setRange({});
                  setTempRange({});
                  closeCalendar();
                }}
                style={styles.actionBtn}
              >
                <Text style={styles.actionBtnText}>Effacer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setRange(tempRange);
                  closeCalendar();
                }}
                style={[
                  styles.actionBtn,
                  tempRange.end && { backgroundColor: "#222" },
                ]}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    tempRange.end && { color: "white" },
                  ]}
                >
                  Confirmer
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* MODAL FILTRES */}
      <Modal
        visible={showFilters}
        transparent
        statusBarTranslucent
        animationType="none"
      >
        <Animated.View
          style={[styles.modalOverlay, { opacity: backdropOpacityFilter }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeFilters} />
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: translateYFilter }],
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            <View {...panResponderFilter.panHandlers}>
              <View style={styles.dragHandle} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Filtres</Text>
                <TouchableOpacity onPress={closeFilters}>
                  <Ionicons name="close-circle" size={28} color="#CCC" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.filterHeaderRow}>
              <Text style={styles.filterSub}>Tranche de prix</Text>
              <Text style={styles.priceValueText}>
                {priceRange[0].toLocaleString()} -{" "}
                {priceRange[1].toLocaleString()} FCFA
              </Text>
            </View>
            <View style={styles.sliderWrapper}>
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as number[])}
                minimumValue={0}
                maximumValue={300000}
                step={10000}
                thumbTintColor="#FF5A5F"
                minimumTrackTintColor="#FF5A5F"
              />
            </View>
            <Text style={styles.filterSub}>Chambres min.</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.chip, rooms === n && styles.chipActive]}
                  onPress={() => setRooms(n)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      rooms === n && styles.chipTextActive,
                    ]}
                  >
                    {n}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.footerActions}>
              <TouchableOpacity
                onPress={() => {
                  setPriceRange([0, 300000]);
                  setRooms(0);
                }}
                style={styles.actionBtn}
              >
                <Text style={styles.actionBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeFilters}
                style={[styles.actionBtn, { backgroundColor: "#222" }]}
              >
                <Text style={[styles.actionBtnText, { color: "white" }]}>
                  Appliquer
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { padding: 20 },
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  filterIconButton: {
    marginLeft: 12,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  input: { flex: 1, fontSize: 16 },
  dateButton: {
    flexDirection: "row",
    backgroundColor: "#FF5A5F",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateButtonText: { color: "#FFF", fontWeight: "bold" },
  categoryBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  catItem: { alignItems: "center", marginRight: 30, paddingBottom: 5 },
  catItemActive: { borderBottomColor: "#222", borderBottomWidth: 2 },
  catText: { fontSize: 12, color: "#717171", marginTop: 4 },
  catTextActive: { color: "#222", fontWeight: "bold" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  },
  priceText: { fontWeight: "bold", fontSize: 14 },
  perNightBadge: { fontSize: 10, color: "#717171" },
  heartIcon: { position: "absolute", top: 15, right: 15, zIndex: 5 },
  cardContent: { padding: 15 },
  titleRow: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { fontSize: 17, fontWeight: "bold" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontWeight: "bold" },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardLocation: { color: "#717171" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    alignSelf: "center",
    marginVertical: 15,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  priceValueText: { fontSize: 13, fontWeight: "700", color: "#FF5A5F" },
  sliderWrapper: { paddingVertical: 20 },
  filterSub: { fontSize: 14, fontWeight: "600", color: "#444" },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    marginRight: 10,
    marginBottom: 10,
  },
  chipActive: { backgroundColor: "#222", borderColor: "#222" },
  chipText: { fontSize: 13, color: "#444" },
  chipTextActive: { color: "white" },
  footerActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 20,
    justifyContent: "space-between",
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 130,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  actionBtnText: { color: "#717171", fontWeight: "700", fontSize: 14 },
  skeletonImage: { width: "100%", height: 230, backgroundColor: "#F0F0F0" },
  skeletonTextLineLarge: {
    width: "70%",
    height: 20,
    backgroundColor: "#F0F0F0",
    marginTop: 15,
    borderRadius: 4,
  },
  skeletonTextLineSmall: {
    width: "40%",
    height: 14,
    backgroundColor: "#F0F0F0",
    marginTop: 10,
    borderRadius: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 40,
  },
  emptyStateCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyStateButton: {
    backgroundColor: "#222",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
