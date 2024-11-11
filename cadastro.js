// Função para lidar com o envio do formulário de cadastro de veículo
document.getElementById('formCadastrarVeiculo').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio do formulário padrão

    const modelo = document.getElementById('modelo').value;
    const placa = document.getElementById('placa').value;
    const proprietario = document.getElementById('proprietario').value;
    const tipoVeiculo = document.getElementById('tipoVeiculo').value;

    const veiculoData = {
        modelo: modelo,
        placa: placa,
        proprietario: proprietario,
        tipo_veiculo: tipoVeiculo
    };

    // Envia os dados para o servidor usando fetch
    fetch('http://localhost:3000/cadastrar-veiculo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(veiculoData)
    })
    .then(response => response.json())
    .then(data => {
        // Exibe uma mensagem de sucesso ou erro
        const messageElement = document.getElementById('message');
        if (data.message) {
            messageElement.textContent = data.message;
            messageElement.style.color = 'green';
        } else {
            messageElement.textContent = 'Ocorreu um erro. Tente novamente.';
            messageElement.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar veículo:', error);
        const messageElement = document.getElementById('message');
        messageElement.textContent = 'Ocorreu um erro ao conectar ao servidor.';
        messageElement.style.color = 'red';
    });
});
