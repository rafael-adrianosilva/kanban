const admin = require('firebase-admin');
const path = require('path');

// Tenta carregar as credenciais da variável de ambiente (Vercel) ou do arquivo local
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Fallback para desenvolvimento local
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e) {
    console.error("Aviso: serviceAccountKey.json não encontrado. Certifique-se de configurar a variável FIREBASE_SERVICE_ACCOUNT no Vercel.");
  }
}

if (serviceAccount && admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "zengrid-seven.firebasestorage.app"
  });
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

if (!db) {
  console.error("ERRO CRÍTICO: Firebase não foi inicializado. Verifique FIREBASE_SERVICE_ACCOUNT.");
}

module.exports = { admin, db };
