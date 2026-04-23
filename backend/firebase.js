const admin = require('firebase-admin');

let db = null;
let initError = null;

try {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Correção comum para chaves privadas no Vercel
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    console.log("Service Account carregado. Project ID:", serviceAccount.project_id);
  } else {
    try {
      serviceAccount = require('./serviceAccountKey.json');
      console.log("Service Account local carregado.");
    } catch (e) {
      console.error("serviceAccountKey.json não encontrado.");
    }
  }

  if (!admin.apps.length) {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin inicializado com sucesso!");
    } else {
      initError = "Nenhuma credencial encontrada. Configure FIREBASE_SERVICE_ACCOUNT.";
      console.error("CRITICAL:", initError);
    }
  }

  if (admin.apps.length > 0) {
    db = admin.firestore();
  }
} catch (e) {
  initError = e.message;
  console.error("ERRO FATAL na inicialização do Firebase:", e.message);
}

module.exports = { admin, db, initError };
