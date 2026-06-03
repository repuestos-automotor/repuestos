// ═══════════════════════════════════════════════════════════════
//  firebase-config.js  —  CONFIGURACIÓN CENTRAL DE FIREBASE
//  Importar este archivo desde todos los módulos del sistema
// ═══════════════════════════════════════════════════════════════

import { initializeApp }                        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth }                              from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore }                         from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage }                           from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ⚙️  REEMPLAZÁ ESTOS VALORES CON LOS DE TU PROYECTO FIREBASE
//  Pasos:
//  1. Ir a https://console.firebase.google.com
//  2. Crear proyecto → "repuestos-electro" (o el nombre que quieras)
//  3. Agregar app web → copiar el objeto firebaseConfig
//  4. Pegar los valores acá abajo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const firebaseConfig = {
  apiKey:            "AIzaSyC9LT9Yhz0Y8smqXJ0sAErLl4Lnf6s0rZ4",
  authDomain:        "repuestos-automotor.firebaseapp.com",
  projectId:         "repuestos-automotor",
  storageBucket:     "repuestos-automotor.firebasestorage.app",
  messagingSenderId: "952203469999",
  appId:             "1:952203469999:web:9d5ec956f834482172a05a"
};

const app     = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
