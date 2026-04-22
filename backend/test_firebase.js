const { db } = require('./firebase');

async function test() {
    try {
        console.log('Testando conexão com o Firestore...');
        const snapshot = await db.collection('usuarios').limit(1).get();
        console.log('Conexão bem sucedida! Documentos encontrados:', snapshot.size);
        process.exit(0);
    } catch (error) {
        console.error('Erro na conexão com o Firestore:', error);
        process.exit(1);
    }
}

test();
