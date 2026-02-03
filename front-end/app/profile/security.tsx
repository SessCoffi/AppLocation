import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    // Simuler succès
    Alert.alert("Succès", "Votre mot de passe a été mis à jour.");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <Stack.Screen
        options={{
          headerTitle: "Sécurité",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.navBtn}
            >
              <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.headerInfo}>
          <View style={styles.shieldIcon}>
            <Ionicons name="shield-checkmark-outline" size={40} color="#000" />
          </View>
          <Text style={styles.title}>Mot de passe</Text>
          <Text style={styles.subtitle}>
            Assurez-vous d'utiliser un mot de passe fort pour protéger votre
            compte.
          </Text>
        </View>

        <View style={styles.form}>
          <PasswordField
            label="Mot de passe actuel"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showPassword}
            toggleShow={() => setShowPassword(!showPassword)}
          />

          <PasswordField
            label="Nouveau mot de passe"
            value={newPassword}
            onChange={setNewPassword}
            show={showPassword}
            toggleShow={() => setShowPassword(!showPassword)}
          />

          <PasswordField
            label="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showPassword}
            toggleShow={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdatePassword}
          >
            <Text style={styles.saveBtnText}>
              Mettre à jour le mot de passe
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Autres options</Text>

          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>
                Double authentification (2FA)
              </Text>
              <Text style={styles.optionSubLabel}>Désactivé</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Appareils connectés</Text>
              <Text style={styles.optionSubLabel}>2 sessions actives</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PasswordField = ({ label, value, onChange, show, toggleShow }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        secureTextEntry={!show}
        placeholder="••••••••"
        placeholderTextColor="#CCC"
        cursorColor="#000"
      />
      <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
        <Ionicons
          name={show ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#999"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
  navBtn: { width: 40, height: 40, justifyContent: "center" },
  headerInfo: { alignItems: "center", marginBottom: 35 },
  shieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: { width: "100%" },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 10,
    color: "#BBB",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 8,
  },
  input: { flex: 1, fontSize: 16, color: "#000", fontWeight: "600" },
  eyeBtn: { padding: 5 },
  saveBtn: {
    backgroundColor: "#000",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 15,
  },
  saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#F5F5F5", marginVertical: 35 },
  optionsSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#AAA",
    textTransform: "uppercase",
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: "600", color: "#222" },
  optionSubLabel: { fontSize: 12, color: "#999", marginTop: 2 },
});
