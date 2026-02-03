import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, Alert, Image 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function AddListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    price: '',
    location: '',
    description: '',
  });

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission requise", "L'accès aux photos est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correction ici
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const nextStep = () => {
    if (step === 1 && (!form.title || !form.price)) {
      Alert.alert("Champs requis", "Titre et prix obligatoires.");
      return;
    }
    if (step < 2) setStep(step + 1);
    else handleFinalize();
  };

  const handleFinalize = () => {
    if (images.length === 0) {
      Alert.alert("Photos", "Ajoutez au moins une photo pour valider.");
      return;
    }
    Alert.alert("Succès", "Annonce publiée !", [{ text: "Ok", onPress: () => router.back() }]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: `Étape ${step}/2`,
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity onPress={() => step > 1 ? setStep(1) : router.back()}>
            <Ionicons name={step > 1 ? "arrow-back" : "close"} size={24} color="black" />
          </TouchableOpacity>
        )
      }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {step === 1 ? (
            <View>
              <Text style={styles.mainTitle}>Décrivez votre bien</Text>
              
              <Text style={styles.label}>Titre de l'annonce</Text>
              <TextInput style={styles.input} placeholder="ex: Villa avec piscine" value={form.title} onChangeText={(t) => setForm({...form, title: t})} />

              <Text style={styles.label}>Prix / nuit (FCFA)</Text>
              <TextInput style={styles.input} placeholder="50000" keyboardType="numeric" value={form.price} onChangeText={(t) => setForm({...form, price: t})} />

              <Text style={styles.label}>Photos (Max 5)</Text>
              <View style={styles.photoContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                    <Ionicons name="camera" size={30} color="#FF5A5F" />
                    <Text style={styles.addPhotoText}>Ajouter</Text>
                  </TouchableOpacity>

                  {images.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <TouchableOpacity style={styles.removeBadge} onPress={() => removeImage(index)}>
                        <Ionicons name="close" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.mainTitle}>Localisation</Text>
              <Text style={styles.label}>Ville et quartier</Text>
              <TextInput style={styles.input} placeholder="Abidjan, Cocody" value={form.location} onChangeText={(t) => setForm({...form, location: t})} />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Décrivez votre bien..." multiline numberOfLines={4} value={form.description} onChangeText={(t) => setForm({...form, description: t})} />
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: step === 1 ? '50%' : '100%' }]} />
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
            <Text style={styles.nextBtnText}>{step === 1 ? "Continuer" : "Finaliser"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { padding: 24 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10, color: '#444', marginTop: 15 },
  input: { borderWidth: 1.5, borderColor: '#F0F0F0', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#FAFAFA' },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  photoContainer: { flexDirection: 'row', marginTop: 10 },
  addPhotoBtn: { 
    width: 100, 
    height: 100, 
    borderRadius: 12, 
    borderWidth: 2, // Corrigé ici (était borderWeight)
    borderStyle: 'dashed', 
    borderColor: '#FF5A5F', 
    backgroundColor: '#FFF8F8', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  addPhotoText: { fontSize: 12, color: '#FF5A5F', fontWeight: 'bold', marginTop: 5 },
  imageWrapper: { marginRight: 12, position: 'relative' },
  previewImage: { width: 100, height: 100, borderRadius: 12 },
  removeBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#222', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },

  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#EEE' },
  nextBtn: { backgroundColor: '#222', paddingVertical: 18, borderRadius: 15, alignItems: 'center' },
  nextBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  progressBarBg: { height: 4, backgroundColor: '#EEE', borderRadius: 2, marginBottom: 20 },
  progressBarFill: { height: 4, backgroundColor: '#FF5A5F', borderRadius: 2 }
});