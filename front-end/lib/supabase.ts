import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Remplacer par tes vraies clés si celles-ci sont des exemples
const supabaseUrl = "https://qhyucirshjykoaghtxyr.supabase.co";
const supabaseAnonKey = "sb_publishable_syZKZc3qH-Ivs7PaEjDKdg_tr-OxIAN";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Crucial pour que "quitter et revenir" fonctionne
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
