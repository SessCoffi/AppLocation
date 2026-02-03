import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState("Semaine");

  const chartData: any = {
    Semaine: [
      { l: "Lun", v: 45 },
      { l: "Mar", v: 80 },
      { l: "Mer", v: 60 },
      { l: "Jeu", v: 110 },
      { l: "Ven", v: 75 },
      { l: "Sam", v: 130 },
      { l: "Dim", v: 90 },
    ],
    Mois: [
      { l: "Sem 1", v: 100 },
      { l: "Sem 2", v: 140 },
      { l: "Sem 3", v: 90 },
      { l: "Sem 4", v: 160 },
    ],
  };

  return (
    // AJOUT DU PADDING BOTTOM ICI POUR BLOQUER AU DESSUS DE LA BARRE SYSTÈME
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{ title: "Analyses & Revenus", headerShadowVisible: false }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* HEADER RÉSUMÉ */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Solde total généré</Text>
          <Text style={styles.balanceAmount}>3.450.000 FCFA</Text>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={16} color="#34C759" />
            <Text style={styles.trendText}>+12.5% vs mois dernier</Text>
          </View>
        </View>

        {/* SÉLECTEUR DE PÉRIODE */}
        <View style={styles.selector}>
          {["Semaine", "Mois", "Année"].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.selBtn, period === p && styles.selBtnActive]}
            >
              <Text
                style={[styles.selText, period === p && styles.selTextActive]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GRAPHIQUE */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Performance des revenus</Text>
          <View style={styles.chartBars}>
            {(chartData[period] || chartData.Semaine).map(
              (item: any, i: number) => (
                <View key={i} style={styles.barContainer}>
                  <View style={[styles.bar, { height: item.v }]} />
                  <Text style={styles.barLabel}>{item.l}</Text>
                </View>
              ),
            )}
          </View>
        </View>

        {/* STATS DÉTAILLÉES */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>28</Text>
            <Text style={styles.statSub}>Nuitées vendues</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statSub}>Taux d'occupation</Text>
          </View>
        </View>

        {/* TRANSACTIONS */}
        <Text style={styles.sectionTitle}>Transactions récentes</Text>
        <View style={styles.transList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.transItem}>
              <View style={styles.transIcon}>
                <Ionicons name="arrow-down" size={20} color="#34C759" />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.transName}>Réservation #{1024 + i}</Text>
                <Text style={styles.transDate}>Janvier 2026</Text>
              </View>
              <Text style={styles.transPrice}>+85.000</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  balanceContainer: {
    padding: 25,
    alignItems: "center",
    backgroundColor: "#FBFBFB",
  },
  balanceLabel: { color: "#717171", fontSize: 14 },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
    marginVertical: 8,
    color: "#1A1A1A",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  selector: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    padding: 4,
  },
  selBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  selBtnActive: { backgroundColor: "#FFF", elevation: 2, shadowOpacity: 0.1 },
  selText: { color: "#717171", fontWeight: "600" },
  selTextActive: { color: "#1A1A1A" },
  chartCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 25,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 20 },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
  },
  barContainer: { alignItems: "center", flex: 1 },
  bar: { width: 15, backgroundColor: "#1A1A1A", borderRadius: 10 },
  barLabel: { fontSize: 10, color: "#AAA", marginTop: 10 },
  statsGrid: { flexDirection: "row", paddingHorizontal: 20, gap: 15 },
  statBox: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statSub: { fontSize: 12, color: "#717171", marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "700", margin: 20 },
  transList: { paddingHorizontal: 20 },
  transItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  transName: { fontWeight: "600", fontSize: 15 },
  transDate: { fontSize: 12, color: "#717171" },
  transPrice: { fontWeight: "700", color: "#34C759" },
});
