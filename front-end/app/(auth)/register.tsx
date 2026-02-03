import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function RegisterScreen() {
  const router = useRouter();

  // États de base
  const [isOwner, setIsOwner] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [password, setPassword] = useState("");

  // États KYC (Propriétaire)
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const takePhoto = async (type: "id" | "selfie") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: type === "id",
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      if (type === "id") setIdCardImage(result.assets[0].uri);
      else setSelfieImage(result.assets[0].uri);
    }
  };

  const handleRegister = () => {
    // Logique d'envoi au backend (envoi du code au Gmail)
    router.push("/verify-email");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen
        options={{ headerTitle: "Créer un compte", headerShadowVisible: false }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Social Login */}
        <TouchableOpacity style={styles.googleBtn}>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.googleBtnText}>S'inscrire avec Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>ou renseignez vos infos</Text>
          <View style={styles.line} />
        </View>

        {/* Formulaire de base */}
        <InputBox
          label="Nom complet"
          value={fullName}
          onChange={setFullName}
          icon="person-outline"
        />
        <InputBox
          label="Email"
          value={email}
          onChange={setEmail}
          icon="mail-outline"
          keyboardType="email-address"
        />
        <InputBox
          label="Téléphone"
          value={phone}
          onChange={setPhone}
          icon="call-outline"
          keyboardType="phone-pad"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <InputBox
              label="Ville"
              value={city}
              onChange={setCity}
              icon="location-outline"
            />
          </View>
          <View style={{ flex: 1 }}>
            <InputBox
              label="Quartier"
              value={neighborhood}
              onChange={setNeighborhood}
              icon="business-outline"
            />
          </View>
        </View>

        <InputBox
          label="Mot de passe"
          value={password}
          onChange={setPassword}
          icon="lock-closed-outline"
          secure
        />

        {/* Toggle Propriétaire */}
        <View style={styles.ownerSwitchContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ownerTitle}>Je veux être Propriétaire</Text>
            <Text style={styles.ownerSub}>
              Nécessite une vérification d'identité
            </Text>
          </View>
          <Switch
            value={isOwner}
            onValueChange={setIsOwner}
            trackColor={{ true: "#000" }}
          />
        </View>

        {/* Section KYC (Visible seulement si isOwner est vrai) */}
        {isOwner && (
          <View style={styles.kycSection}>
            <Text style={styles.kycTitle}>Vérification d'identité</Text>

            <View style={styles.photoGrid}>
              <TouchableOpacity
                style={styles.photoBox}
                onPress={() => takePhoto("id")}
              >
                {idCardImage ? (
                  <Image source={{ uri: idCardImage }} style={styles.preview} />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={30} color="#999" />
                    <Text style={styles.photoLabel}>Photo de la pièce</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoBox}
                onPress={() => takePhoto("selfie")}
              >
                {selfieImage ? (
                  <Image source={{ uri: selfieImage }} style={styles.preview} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={30} color="#999" />
                    <Text style={styles.photoLabel}>Photo de face</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.mainBtn} onPress={handleRegister}>
          <Text style={styles.mainBtnText}>S'inscrire</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputBox = ({
  label,
  value,
  onChange,
  icon,
  secure,
  keyboardType,
}: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={18} color="#999" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        placeholder={`Votre ${label.toLowerCase()}`}
        placeholderTextColor="#CCC"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scroll: { padding: 25 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 20,
  },
  googleBtnText: { marginLeft: 10, fontWeight: "600", color: "#000" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#EEE" },
  dividerText: { marginHorizontal: 10, color: "#AAA", fontSize: 12 },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 10,
    color: "#BBB",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 5,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: "500", color: "#000" },
  row: { flexDirection: "row" },
  ownerSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  ownerTitle: { fontSize: 15, fontWeight: "700" },
  ownerSub: { fontSize: 12, color: "#999" },
  kycSection: { marginTop: 25 },
  kycTitle: { fontSize: 14, fontWeight: "700", marginBottom: 15 },
  photoGrid: { flexDirection: "row", justifyContent: "space-between" },
  photoBox: {
    width: "48%",
    height: 120,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photoLabel: { fontSize: 11, color: "#999", marginTop: 8 },
  preview: { width: "100%", height: "100%" },
  mainBtn: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
  },
  mainBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
