const { db, initError } = require('./firebase');

// Exportamos o db (Firestore) para ser usado no server.js
module.exports = db;
module.exports.initError = initError;
