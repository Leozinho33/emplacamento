const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Porta do servidor
const porta = 3000;

// Função genérica para ler JSON de um arquivo
const readJSONFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData), 'utf-8');
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    try {
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : defaultData;
    } catch (error) {
        console.error(`Erro ao ler o arquivo JSON (${filePath}):`, error);
        return defaultData;
    }
};

// Função genérica para salvar JSON em um arquivo
const saveJSONFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Funções específicas para veículos e placas
const readVehicles = () => readJSONFile(path.join(__dirname, 'veiculos.json'));
const saveVehicles = (vehicles) => saveJSONFile(path.join(__dirname, 'veiculos.json'), vehicles);
const readPlates = () => readJSONFile(path.join(__dirname, 'placas.json'));
const savePlates = (plates) => saveJSONFile(path.join(__dirname, 'placas.json'), plates);

// Função para gerar um token de sessão
const generateSessionToken = () => crypto.randomBytes(16).toString('hex');

// Dicionário para armazenar sessões ativas
const sessions = {};

// Criação do servidor
const server = http.createServer((req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    console.log(`Recebido: ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const handleHTMLPage = (filePath, res) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'Página não encontrada' }));
                console.error('Erro ao carregar a página:', err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    };

    const handleJSONRequest = (req, callback) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => callback(JSON.parse(body)));
    };

    // Rotas
    if (req.method === 'GET' && req.url === '/registrar-veiculo') {
        handleHTMLPage(path.join(__dirname, 'registrar_veiculo.html'), res);
        
    } else if (req.method === 'POST' && req.url === '/cadastrar-veiculo') {
        handleJSONRequest(req, vehicleData => {
            const vehicles = readVehicles();
            if (vehicles.some(vehicle => vehicle.placa === vehicleData.placa)) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Placa já registrada' }));
            } else {
                vehicles.push({
                    id: vehicles.length + 1,
                    modelo: vehicleData.modelo,
                    fabricante: vehicleData.fabricante,
                    ano: vehicleData.ano,
                    placa: vehicleData.placa
                });
                saveVehicles(vehicles);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Veículo cadastrado com sucesso' }));
            }
        });

    } else if (req.method === 'POST' && req.url === '/cadastrar-placa') {
        handleJSONRequest(req, plateData => {
            const plates = readPlates();
            plates.push({
                id: plates.length + 1,
                placa: plateData.placa,
                veiculoId: plateData.veiculoId
            });
            savePlates(plates);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Placa cadastrada com sucesso' }));
        });

    } else if (req.method === 'POST' && req.url === '/login') {
        handleJSONRequest(req, loginData => {
            const users = readVehicles();
            const user = users.find(user => user.email === loginData.email && user.senha === loginData.senha);
            if (user) {
                const sessionToken = generateSessionToken();
                sessions[sessionToken] = user;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Login bem-sucedido', user, sessionToken }));
            } else {
                res.writeHead(401);
                res.end(JSON.stringify({ message: 'Credenciais inválidas' }));
            }
        });

    } else if (req.method === 'POST' && req.url === '/registrar-placa') {
        handleJSONRequest(req, ({ userId, vehicleId, placa }) => {
            const vehicles = readVehicles();
            const plates = readPlates();
            const vehicle = vehicles.find(vehicle => vehicle.id === vehicleId);

            if (!vehicle) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Veículo não encontrado' }));
            } else {
                // Verifica se a placa já está registrada para outro veículo
                if (plates.some(plate => plate.placa === placa)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Placa já registrada' }));
                    return;
                }

                // Registra a placa
                plates.push({
                    id: plates.length + 1,
                    placa,
                    veiculoId: vehicle.id
                });

                savePlates(plates); // Salva as alterações

                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Placa registrada com sucesso', placa }));
                console.log('Placa registrada com sucesso:', placa);
            }
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/excluir-veiculo')) {
        handleJSONRequest(req, ({ vehicleId }) => {
            const vehicles = readVehicles();
            const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
            if (updatedVehicles.length === vehicles.length) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'Veículo não encontrado' }));
            } else {
                saveVehicles(updatedVehicles);
                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Veículo excluído com sucesso' }));
            }
        });

    } else if (req.method === 'DELETE' && req.url.startsWith('/excluir-placa')) {
        handleJSONRequest(req, ({ plateId }) => {
            const plates = readPlates();
            const updatedPlates = plates.filter(plate => plate.id !== plateId);
            if (updatedPlates.length === plates.length) {
                res.writeHead(404);
                res.end(JSON.stringify({ message: 'Placa não encontrada' }));
            } else {
                savePlates(updatedPlates);
                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Placa excluída com sucesso' }));
            }
        });

    } else if (req.method === 'GET' && req.url.startsWith('/dashboard')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const sessionToken = urlParams.get('sessionToken');

        if (sessionToken && sessions[sessionToken]) {
            const user = sessions[sessionToken];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Usuário autenticado', user }));
        } else {
            res.writeHead(401);
            res.end(JSON.stringify({ message: 'Usuário não logado' }));
        }

    } else if (req.method === 'GET' && req.url === '/veiculos') {
        const vehicles = readVehicles();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(vehicles));

    } else if (req.method === 'GET' && req.url === '/placas') {
        const plates = readPlates();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(plates));

    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Rota não encontrada' }));
    }
});

// Inicia o servidor
server.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}/`);
});
