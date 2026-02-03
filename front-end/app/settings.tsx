import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [faceId, setFaceId] = useState(false);

  return (
    // On applique insets.bottom ici pour que rien ne glisse sous la barre système
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          headerTitle: "Paramètres",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
          headerTintColor: "#222",
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        // Le paddingBottom ici assure un espace esthétique en fin de liste
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Compte</Text>
        </View>

        <SettingRow
          icon="person-outline"
          title="Informations personnelles"
          onPress={() => router.push("/profile/personal-info")}
        />
        <SettingRow
          icon="shield-checkmark-outline"
          title="Sécurité"
          onPress={() => router.push("/profile/security")}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Préférences</Text>
        </View>

        <View style={styles.rowItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={22} color="#6b6b6b" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Notifications Push</Text>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: "#D1D1D6", true: "#222" }}
              thumbColor="white"
            />
          </View>
        </View>

        <View style={styles.rowItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="finger-print-outline" size={22} color="#6b6b6b" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Face ID / Biométrie</Text>
            <Switch
              value={faceId}
              onValueChange={setFaceId}
              trackColor={{ false: "#D1D1D6", true: "#222" }}
              thumbColor="white"
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assistance</Text>
        </View>

        <SettingRow
          icon="help-circle-outline"
          title="Centre d'aide"
          onPress={() => {}}
        />
        <SettingRow
          icon="document-text-outline"
          title="Conditions générales"
          onPress={() => {}}
        />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?")
          }
        >
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.4</Text>
      </ScrollView>
    </View>
  );
}

const SettingRow = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.rowItem} onPress={onPress}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={22} color="#6b6b6b" />
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.rowLabel}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
    backgroundColor: "#FBFBFB",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#AAA",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rowItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 15,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  logoutBtn: {
    marginTop: 40,
    alignSelf: "center",
    padding: 10,
  },
  logoutText: {
    color: "#FF5A5F",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  version: {
    textAlign: "center",
    color: "#DDD",
    fontSize: 12,
    marginTop: 20,
  },
});
