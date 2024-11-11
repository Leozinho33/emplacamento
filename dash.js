// Recuperar as informações do veículo
document.addEventListener("DOMContentLoaded", () => {
    const vehicle = JSON.parse(localStorage.getItem('vehicle'));
    const vehicleListElement = document.getElementById("vehicle-list");
    const vehicleButton = document.getElementById("vehicle-button");

    if (vehicle) {
        document.getElementById("vehicle-id").textContent = vehicle.id;
        document.getElementById("vehicle-model").textContent = vehicle.modelo;
        document.getElementById("vehicle-owner").textContent = vehicle.proprietario;
    } else {
        alert("Veículo não encontrado.");
        window.location.href = "consultar-veiculo.html"; // Redireciona para a página de consulta de veículos
    }

    // Atribuir ações aos botões
    document.getElementById("logout-button").addEventListener("click", logout);
    vehicleButton.addEventListener("click", toggleVehicles);

    // Função de logout
    function logout() {
        localStorage.removeItem('vehicle');
        window.location.href = "consultar-veiculo.html"; // Redireciona para a página de consulta de veículos
    }

    // Carregar e exibir veículos
    async function toggleVehicles() {
        if (!vehicleListElement.classList.contains("open")) {
            try {
                const response = await fetch('http://localhost:3000/veiculos');
                if (!response.ok) throw new Error('Erro ao carregar veículos');

                const vehicles = await response.json();
                const vehicleList = document.getElementById("vehicles");

                // Limpar lista de veículos
                vehicleList.innerHTML = "";

                // Adicionar veículos à lista
                vehicles.forEach(vehicle => {
                    const li = document.createElement("li");
                    li.textContent = `${vehicle.modelo} - Placa: ${vehicle.placa} - Proprietário: ${vehicle.proprietario}`;
                    vehicleList.appendChild(li);
                });
            } catch (error) {
                console.error('Erro ao buscar os veículos:', error);
                alert('Erro ao carregar os veículos.');
            }
        }

        // Alternar a exibição da lista de veículos e o deslocamento do botão
        vehicleListElement.classList.toggle("open");
        vehicleButton.classList.toggle("shifted");
    }
});
