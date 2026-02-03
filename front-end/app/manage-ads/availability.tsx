import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

// DONNÉES DE TEST (S'assurer que les adId correspondent aux IDs de vos villas)
const MOCK_UNAVAILABILITIES = [
  {
    id: "1",
    adId: "1",
    start: "2024-06-15",
    end: "2024-06-20",
    reason: "Vacances familiales",
    status: "À venir",
  },
  {
    id: "2",
    adId: "1",
    start: "2024-05-01",
    end: "2024-05-03",
    reason: "Rénovation cuisine",
    status: "À venir",
  },
  {
    id: "3",
    adId: "1",
    start: "2024-01-10",
    end: "2024-01-12",
    reason: "Maintenance clim",
    status: "Terminé",
  },
  {
    id: "4",
    adId: "1",
    start: "2023-12-24",
    end: "2023-12-26",
    reason: "Fêtes fin d'année",
    status: "Terminé",
  },
];

export default function AvailabilitySummaryScreen() {
  const { id, title } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // ÉTATS
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<"start" | "end" | null>(null);

  const filters = ["Tous", "À venir", "Terminé"];

  // LOGIQUE DE VALIDATION
  const isFormValid = useMemo(() => {
    return reason.trim().length > 0 && endDate >= startDate;
  }, [reason, startDate, endDate]);

  // FILTRAGE AVEC SÉCURITÉ SUR LE TYPE D'ID (String conversion)
  const data = useMemo(() => {
    let filtered = MOCK_UNAVAILABILITIES.filter(
      (item) => String(item.adId) === String(id),
    );

    if (activeFilter !== "Tous") {
      filtered = filtered.filter((item) => item.status === activeFilter);
    }
    return filtered.sort(
      (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
    );
  }, [id, activeFilter]);

  // RÉINITIALISATION ET ACTIONS
  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setReason("");
  };

  const handleCancel = () => {
    resetForm();
    setIsPopupVisible(false);
  };

  const handleSave = () => {
    if (!isFormValid) return;
    setIsPopupVisible(false);
    resetForm();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(null);
      return;
    }
    const currentDate =
      selectedDate || (showPicker === "start" ? startDate : endDate);
    setShowPicker(null);

    if (showPicker === "start") {
      setStartDate(currentDate);
      if (currentDate > endDate) setEndDate(currentDate);
    } else {
      setEndDate(currentDate);
    }
  };

  // RENDU DES ÉTATS VIDES
  const renderEmptyState = () => {
    let iconName: any = "calendar-outline";
    let message = "";
    let subMessage = "";

    switch (activeFilter) {
      case "À venir":
        iconName = "time-outline";
        message = "Aucun blocage à venir";
        subMessage = "Toutes les dates futures sont disponibles.";
        break;
      case "Terminé":
        iconName = "checkmark-done-circle-outline";
        message = "Historique vide";
        subMessage = "Aucun blocage passé enregistré.";
        break;
      default:
        iconName = "calendar-outline";
        message = "Aucune indisponibilité";
        subMessage = `Le calendrier de ${title || "cette villa"} est libre.`;
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name={iconName} size={64} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>{message}</Text>
        <Text style={styles.emptySubTitle}>{subMessage}</Text>
      </View>
    );
  };

  const renderItem = ({
    item,
  }: {
    item: (typeof MOCK_UNAVAILABILITIES)[0];
  }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#FF5A5F" />
          <Text style={styles.dateBadgeText}>Période</Text>
        </View>
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor:
                item.status === "Terminé" ? "#F5F5F5" : "#E8F5E9",
            },
          ]}
        >
          <Text
            style={[
              styles.statusTagText,
              { color: item.status === "Terminé" ? "#8E8E93" : "#34C759" },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.dateRange}>
        Du {new Date(item.start).toLocaleDateString("fr-FR")} au{" "}
        {new Date(item.end).toLocaleDateString("fr-FR")}
      </Text>
      <View style={styles.reasonRow}>
        <Text style={styles.reasonLabel}>Motif :</Text>
        <Text style={styles.reasonValue}>{item.reason}</Text>
      </View>
      <TouchableOpacity style={styles.deleteAction}>
        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        <Text style={styles.deleteActionText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "Indisponibilités", headerShadowVisible: false }}
      />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={[styles.headerInfo, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.propertyTitle}>{title || "Propriété"}</Text>
        <Text style={styles.subtitle}>Liste des dates bloquées</Text>
      </View>

      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterTab,
                activeFilter === f && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === f && styles.filterTabTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={renderEmptyState}
      />

      <TouchableOpacity
        style={[styles.addBtn, { bottom: insets.bottom + 20 }]}
        onPress={() => setIsPopupVisible(true)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.addBtnText}>Bloquer des dates</Text>
      </TouchableOpacity>

      {/* POPUP PLEIN ÉCRAN */}
      <Modal
        visible={isPopupVisible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.popupOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.popupContent}
              >
                <Text style={styles.popupTitle}>Nouvelle indisponibilité</Text>

                <View style={styles.dateRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Début</Text>
                    <TouchableOpacity
                      style={styles.dateSelector}
                      onPress={() => setShowPicker("start")}
                    >
                      <Text style={styles.dateSelectorText}>
                        {startDate.toLocaleDateString("fr-FR")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Fin</Text>
                    <TouchableOpacity
                      style={styles.dateSelector}
                      onPress={() => setShowPicker("end")}
                    >
                      <Text style={styles.dateSelectorText}>
                        {endDate.toLocaleDateString("fr-FR")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Motif du blocage</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Travaux, Occupation..."
                  value={reason}
                  onChangeText={setReason}
                  placeholderTextColor="#C7C7CC"
                />

                <View style={styles.popupActions}>
                  <TouchableOpacity
                    style={styles.cancelLink}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelLinkText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      !isFormValid && styles.confirmBtnDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!isFormValid}
                  >
                    <Text style={styles.confirmBtnText}>Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {showPicker && (
        <DateTimePicker
          value={showPicker === "start" ? startDate : endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          minimumDate={showPicker === "end" ? startDate : new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  headerInfo: { paddingHorizontal: 20, paddingBottom: 5 },
  propertyTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#8E8E93", marginTop: 4 },
  filterSection: { height: 70, justifyContent: "center" },
  filterScroll: { paddingHorizontal: 20, alignItems: "center", gap: 10 },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  filterTabActive: { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A" },
  filterTabText: { fontSize: 14, fontWeight: "600", color: "#717171" },
  filterTabTextActive: { color: "#FFF" },
  listContent: { flexGrow: 1, padding: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF5A5F",
    textTransform: "uppercase",
  },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusTagText: { fontSize: 10, fontWeight: "800" },
  dateRange: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  reasonRow: { flexDirection: "row", gap: 5, marginBottom: 15 },
  reasonLabel: { fontSize: 13, color: "#8E8E93" },
  reasonValue: { fontSize: 13, color: "#4A4A4A", fontWeight: "600" },
  deleteAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 12,
  },
  deleteActionText: { fontSize: 13, color: "#FF3B30", fontWeight: "600" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 15,
    textAlign: "center",
  },
  emptySubTitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  addBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    elevation: 5,
  },
  addBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  popupContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    marginTop: 12,
  },
  dateRow: { flexDirection: "row", gap: 15 },
  dateSelector: {
    backgroundColor: "#F8F8F8",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
  },
  dateSelectorText: { color: "#1A1A1A", fontSize: 14, fontWeight: "600" },
  textInput: {
    backgroundColor: "#F8F8F8",
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  popupActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    gap: 15,
  },
  cancelLink: { flex: 1, alignItems: "center" },
  cancelLinkText: { color: "#8E8E93", fontWeight: "600", fontSize: 15 },
  confirmBtn: {
    flex: 2,
    backgroundColor: "#1A1A1A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnDisabled: { backgroundColor: "#E0E0E0", opacity: 0.8 },
  confirmBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
