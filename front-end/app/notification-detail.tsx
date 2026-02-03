import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationDetailScreen() {
  const { title, body, time, type, listing } = useLocalSearchParams();
  const router = useRouter();

  const handleAction = () => {
    if (type === "booking" && listing) {
      try {
        const listingData = JSON.parse(listing as string);
        router.push({
          pathname: "/details",
          params: listingData,
        });
      } catch (e) {
        console.error("Erreur de parsing:", e);
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Détails",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 5 }}
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={type === "booking" ? "calendar" : "mail"}
            size={40}
            color="#FF5A5F"
          />
        </View>

        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.divider} />
        <Text style={styles.bodyText}>{body}</Text>

        <TouchableOpacity style={styles.actionBtn} onPress={handleAction}>
          <Text style={styles.actionBtnText}>
            {type === "booking" ? "Voir l'appartement" : "Retour"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  content: { padding: 25, alignItems: "center" },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  timeText: { color: "#AAA", fontSize: 14, marginBottom: 10 },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: "#FF5A5F",
    marginVertical: 25,
  },
  bodyText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 26,
    textAlign: "center",
  },
  actionBtn: {
    backgroundColor: "#222",
    width: "100%",
    padding: 18,
    borderRadius: 15,
    marginTop: 40,
    alignItems: "center",
  },
  actionBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
