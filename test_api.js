const fetch = require('node-fetch');

async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/estatisticas/historico?period=daily', {
            headers: {
                'Authorization': 'Bearer ' + 'TOKEN_AQUI' // I don't have a token, but let's see if it 401s or 500s
            }
        });
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testApi();
