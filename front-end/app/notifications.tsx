import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const READ_NOTIFS_KEY = "@read_notifications_ids";

const INITIAL_NOTIFS = [
  {
    id: "1",
    title: "Réservation confirmée",
    body: "Votre séjour à la Villa Oasis commence demain. L'hôte vous attend à 14h.",
    type: "booking",
    time: "Il y a 2h",
    listingData: {
      id: "1",
      title: "Villa Oasis",
      price: "85.000 FCFA",
      location: "Assinie, Côte d'Ivoire",
      rating: "4.9",
      latitude: "5.2345",
      longitude: "-3.2123",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      ]),
    },
  },
  {
    id: "2",
    title: "Nouveau message",
    body: "L'hôte a répondu à votre question sur les équipements.",
    type: "chat",
    time: "Il y a 5h",
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const loadReadStatus = async () => {
      const stored = await AsyncStorage.getItem(READ_NOTIFS_KEY);
      if (stored) setReadIds(JSON.parse(stored));
    };
    loadReadStatus();
  }, []);

  const handlePress = async (item: any) => {
    if (!readIds.includes(item.id)) {
      const newReadIds = [...readIds, item.id];
      setReadIds(newReadIds);
      await AsyncStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(newReadIds));
    }

    router.push({
      pathname: "/notification-detail",
      params: {
        title: item.title,
        body: item.body,
        time: item.time,
        type: item.type,
        listing: item.listingData ? JSON.stringify(item.listingData) : null,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerTitle: "Notifications", headerShadowVisible: false }}
      />
      <FlatList
        data={INITIAL_NOTIFS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isRead = readIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.notifItem, !isRead && styles.unreadLine]}
              onPress={() => handlePress(item)}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={item.type === "booking" ? "calendar" : "mail"}
                  size={22}
                  color="#FF5A5F"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <View style={styles.row}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={[
                        styles.notifTitle,
                        isRead && { color: "#717171", fontWeight: "normal" },
                      ]}
                    >
                      {item.title}
                    </Text>
                    {!isRead && <View style={styles.redDot} />}
                  </View>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  notifItem: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  unreadLine: { backgroundColor: "#FFF9F9" },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: { fontWeight: "bold", fontSize: 15, color: "#222" },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
    marginLeft: 8,
  },
  timeText: { fontSize: 12, color: "#AAA" },
  notifBody: { fontSize: 13, color: "#717171" },
});
