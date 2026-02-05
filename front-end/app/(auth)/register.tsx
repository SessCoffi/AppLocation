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
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [password, setPassword] = useState("");
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const uploadImage = async (uri: string, folder: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, arrayBuffer, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;
      const { data } = supabase.storage
        .from("kyc-documents")
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert(
        "Champs requis",
        "Le nom, l'email et le mot de passe sont obligatoires.",
      );
      return;
    }

    setLoading(true);
    try {
      let photoPieceUrl = null;
      let photoFaceUrl = null;

      if (isOwner) {
        if (!idCardImage || !selfieImage) {
          throw new Error(
            "Veuillez fournir les deux photos pour le profil propriétaire.",
          );
        }
        photoPieceUrl = await uploadImage(idCardImage, "pieces");
        photoFaceUrl = await uploadImage(selfieImage, "selfies");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            city: city,
            neighborhood: neighborhood,
            is_owner: isOwner,
            photo_piece_url: photoPieceUrl,
            photo_face_url: photoFaceUrl,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: email },
        });
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async (type: "id" | "selfie") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Accès appareil photo requis.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) {
      if (type === "id") setIdCardImage(result.assets[0].uri);
      else setSelfieImage(result.assets[0].uri);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.pageTitle}>Créer un compte</Text>
          <Text style={styles.pageSubtitle}>
            Remplissez les informations ci-dessous pour rejoindre l'aventure.
          </Text>

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
              ios_backgroundColor="#E9E9E9"
              trackColor={{ false: "#E9E9E9", true: "#D1D1D1" }}
              thumbColor={isOwner ? "#717171" : "#F4F4F4"}
            />
          </View>

          {isOwner && (
            <View style={styles.kycSection}>
              <Text style={styles.kycTitle}>Vérification d'identité</Text>
              <View style={styles.photoGrid}>
                <TouchableOpacity
                  style={styles.photoBox}
                  onPress={() => takePhoto("id")}
                >
                  {idCardImage ? (
                    <Image
                      source={{ uri: idCardImage }}
                      style={styles.preview}
                    />
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
                    <Image
                      source={{ uri: selfieImage }}
                      style={styles.preview}
                    />
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

          <TouchableOpacity
            style={styles.mainBtn}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.mainBtnText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>
              Déjà un compte ? <Text style={styles.bold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
        autoCapitalize="none"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scroll: { padding: 25 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
  },
  pageSubtitle: { fontSize: 14, color: "#999", marginBottom: 30 },
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
  input: { flex: 1, fontSize: 15, color: "#000" },
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
    minHeight: 56,
    justifyContent: "center",
  },
  mainBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  backLink: { marginTop: 20, marginBottom: 40, alignItems: "center" },
  backLinkText: { color: "#999", fontSize: 14 },
  bold: { color: "#000", fontWeight: "700" },
});
