const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Correção comum para chaves privadas no Vercel
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } catch (e) {
    console.error("Erro ao parsear FIREBASE_SERVICE_ACCOUNT:", e.message);
  }
} else {
  try {
    // Fallback local
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e) {
    // Apenas avisa, não quebra o build
  }
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin inicializado com Service Account.");
  } else {
    // No Vercel, isso causará o erro 16 UNAUTHENTICATED se tentar usar o db
    console.error("CRITICAL: Nenhuma credencial do Firebase encontrada! Configure FIREBASE_SERVICE_ACCOUNT no Vercel.");
    admin.initializeApp(); // Tenta usar default credentials
  }
}

const db = admin.firestore();

module.exports = { admin, db };
