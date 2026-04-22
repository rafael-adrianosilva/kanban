const admin = require('firebase-admin');
const path = require('path');

// ATENÇÃO: Certifique-se de que o arquivo serviceAccountKey.json esteja nesta pasta!
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
