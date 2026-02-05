import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
  TextInput,
  KeyboardAvoidingView,
  Animated,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toastAnim] = useState(new Animated.Value(-100));

  // États des informations utilisateur
  const [profileImage, setProfileImage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [neighborhood, setNeighborhood] = useState(""); // Nouvel état pour le quartier

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        setName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
        setPhone(user.user_metadata?.phone || "");
        setLocation(user.user_metadata?.city || "");
        setNeighborhood(user.user_metadata?.neighborhood || ""); // Récupération quartier
        setProfileImage(
          user.user_metadata?.photo_face_url ||
            user.user_metadata?.photo_piece_url ||
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400",
        );
      }
    } catch (error: any) {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          phone: phone,
          city: location,
          neighborhood: neighborhood, // Sauvegarde quartier
        },
      });

      if (error) throw error;
      triggerSuccess();
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setUpdating(false);
    }
  };

  const triggerSuccess = () => {
    setIsEditing(false);
    Animated.spring(toastAnim, {
      toValue: insets.top + 8,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2000);
  };

  const handleImagePicker = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert("Permission", "Accès nécessaire.");
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: false,
      quality: 0.5,
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImageSourceOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Annuler", "Prendre une photo", "Galerie"],
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) handleImagePicker(true);
          else if (i === 2) handleImagePicker(false);
        },
      );
    } else {
      Alert.alert("Photo", "Changer votre photo", [
        { text: "Caméra", onPress: () => handleImagePicker(true) },
        { text: "Galerie", onPress: () => handleImagePicker(false) },
        { text: "Annuler", style: "cancel" },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        style={[
          styles.toastWrapper,
          { transform: [{ translateY: toastAnim }] },
        ]}
      >
        <View style={styles.toastPill}>
          <Ionicons name="checkmark-sharp" size={14} color="white" />
          <Text style={styles.toastText}>Profil enregistré</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.container}>
          <Stack.Screen
            options={{
              headerTitle: "",
              headerTransparent: true,
              headerShadowVisible: false,
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() =>
                    isEditing ? setIsEditing(false) : router.back()
                  }
                  style={styles.navBtn}
                >
                  <Ionicons
                    name={isEditing ? "close-outline" : "chevron-back"}
                    size={28}
                    color="black"
                  />
                </TouchableOpacity>
              ),
              headerRight: () =>
                isEditing && (
                  <TouchableOpacity
                    onPress={handleSave}
                    style={styles.headerSaveBtn}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.headerSaveText}>Enregistrer</Text>
                    )}
                  </TouchableOpacity>
                ),
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingTop: insets.top + 45,
              paddingBottom: isEditing ? 100 : 40,
            }}
          >
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={showImageSourceOptions}
                activeOpacity={0.9}
              >
                <Image source={{ uri: profileImage }} style={styles.avatar} />
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </TouchableOpacity>
              {!isEditing && (
                <>
                  <Text style={styles.userName}>{name}</Text>
                  <Text style={styles.userRole}>Membre de la communauté</Text>
                </>
              )}
            </View>

            <View style={styles.formContainer}>
              <EditableRow
                label="Nom complet"
                value={name}
                onChange={setName}
                isEditing={isEditing}
                icon="person-outline"
              />
              <EditableRow
                label="Email (non modifiable)"
                value={email}
                isEditing={false}
                icon="mail-outline"
              />
              <EditableRow
                label="Téléphone"
                value={phone}
                onChange={setPhone}
                isEditing={isEditing}
                icon="call-outline"
              />
              <EditableRow
                label="Ville"
                value={location}
                onChange={setLocation}
                isEditing={isEditing}
                icon="location-outline"
              />
              {/* NOUVEAU CHAMP QUARTIER */}
              <EditableRow
                label="Quartier"
                value={neighborhood}
                onChange={setNeighborhood}
                isEditing={isEditing}
                icon="map-outline"
              />
            </View>

            {!isEditing && (
              <TouchableOpacity
                style={styles.mainActionBtn}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.mainActionText}>Modifier le profil</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const EditableRow = ({ label, value, icon, isEditing, onChange }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[styles.row, isEditing && isFocused && styles.rowFocused]}>
      <View
        style={[styles.iconBox, isEditing && isFocused && styles.iconBoxActive]}
      >
        <Ionicons name={icon} size={20} color={isFocused ? "#000" : "#999"} />
      </View>
      <View style={styles.contentBox}>
        <Text style={styles.label}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            cursorColor="#000"
            placeholder={`Votre ${label.toLowerCase()}`}
          />
        ) : (
          <Text style={styles.value}>{value || "Non renseigné"}</Text>
        )}
      </View>
    </View>
  );
};

// ... Les styles restent identiques à ton code original ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  navBtn: { marginLeft: 10, width: 40, height: 40, justifyContent: "center" },
  headerSaveBtn: {
    marginRight: 15,
    backgroundColor: "#000",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  headerSaveText: { color: "white", fontWeight: "700", fontSize: 13 },
  toastWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10000,
  },
  toastPill: {
    backgroundColor: "#2ECC71",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 3,
  },
  toastText: { color: "white", fontWeight: "700", fontSize: 11, marginLeft: 5 },
  avatarSection: { alignItems: "center", marginTop: 0 },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#fff",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 15,
  },
  userRole: { fontSize: 14, color: "#999", fontWeight: "500", marginTop: 4 },
  formContainer: { paddingHorizontal: 25, marginTop: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  rowFocused: { borderBottomColor: "#000" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxActive: { backgroundColor: "#F0F0F0" },
  contentBox: { marginLeft: 15, flex: 1 },
  label: {
    fontSize: 10,
    color: "#BBB",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: { fontSize: 16, color: "#1A1A1A", fontWeight: "600", marginTop: 2 },
  input: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
    marginTop: 2,
    padding: 0,
  },
  mainActionBtn: {
    flexDirection: "row",
    marginHorizontal: 25,
    marginTop: 30,
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  mainActionText: { color: "white", fontWeight: "700", fontSize: 16 },
});
