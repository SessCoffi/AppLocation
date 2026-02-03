import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<any>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Déplacement automatique vers le champ suivant
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      // Ici, appel API pour vérifier le code
      router.replace("/(tabs)"); // Redirection vers l'accueil
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen
        options={{ headerTitle: "Vérification", headerShadowVisible: false }}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Vérifiez votre boîte mail</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un code à 6 chiffres à votre adresse Gmail.
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                if (el) inputs.current[index] = el;
              }}
              style={styles.codeInput}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (
                  nativeEvent.key === "Backspace" &&
                  !code[index] &&
                  index > 0
                ) {
                  inputs.current[index - 1].focus();
                }
              }}
              value={digit}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
          <Text style={styles.verifyBtnText}>Vérifier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendBtn}>
          <Text style={styles.resendText}>Renvoyer le code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  content: { padding: 25, alignItems: "center", paddingTop: 50 },
  title: { fontSize: 24, fontWeight: "800", color: "#1A1A1A" },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderBottomWidth: 2,
    borderBottomColor: "#EEE",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  verifyBtn: {
    backgroundColor: "#000",
    width: "100%",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  verifyBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  resendBtn: { marginTop: 25 },
  resendText: {
    color: "#999",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
