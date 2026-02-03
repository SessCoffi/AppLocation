import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavoritesContext = createContext<any>(null);

// Clé pour le stockage local
const FAVORITES_STORAGE_KEY = "@app_favorites_storage";

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favorites, setFavorites] = useState<any[]>([]);

  // 1. Charger les favoris au démarrage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des favoris :", error);
    }
  };

  // 2. Fonction pour sauvegarder physiquement sur le téléphone
  const saveToStorage = async (newFavorites: any[]) => {
    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(newFavorites),
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des favoris :", error);
    }
  };

  const toggleFavorite = (property: any) => {
    setFavorites((prev) => {
      const isExist = prev.find((fav) => fav.id === property.id);
      let updatedList;

      if (isExist) {
        updatedList = prev.filter((fav) => fav.id !== property.id);
      } else {
        updatedList = [...prev, property];
      }

      // On lance la sauvegarde immédiatement
      saveToStorage(updatedList);
      return updatedList;
    });
  };

  const isFavorite = (id: string) => favorites.some((fav) => fav.id === id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
