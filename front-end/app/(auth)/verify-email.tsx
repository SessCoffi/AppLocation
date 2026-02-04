import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function VerifyEmailScreen() {
  const router = useRouter();
  // Récupère l'email passé en paramètre depuis la page Register
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert("Erreur", "Veuillez entrer le code à 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'signup',
      });

      if (error) throw error;

      if (data.session) {
        Alert.alert("Succès", "Votre compte est validé !");
        // Redirige vers la page d'accueil ou le dashboard
        router.replace("/"); 
      }
    } catch (error: any) {
      Alert.alert("Erreur de vérification", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) Alert.alert("Erreur", error.message);
    else Alert.alert("Succès", "Un nouveau code a été envoyé.");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen options={{ headerTitle: "Vérification", headerShadowVisible: false }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Vérifiez votre boîte mail</Text>
        <Text style={styles.sub}>
          Nous avons envoyé un code de confirmation à {"\n"}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <TextInput
          style={styles.otpInput}
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />

        <TouchableOpacity 
          style={[styles.mainBtn, loading && { backgroundColor: "#444" }]} 
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.mainBtnText}>Confirmer</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={resendCode} style={styles.resendBtn}>
          <Text style={styles.resendText}>Je n'ai pas reçu de code ? <Text style={{fontWeight: '700'}}>Renvoyer</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  content: { padding: 25, alignItems: 'center', paddingTop: 50 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  sub: { fontSize: 14, color: "#777", textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  emailText: { color: "#000", fontWeight: "600" },
  otpInput: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 15,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 30
  },
  mainBtn: {
    backgroundColor: "#000",
    width: '100%',
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  mainBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  resendBtn: { marginTop: 25 },
  resendText: { color: "#999", fontSize: 13 }
});