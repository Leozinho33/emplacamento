import os
import json
import random

# Nome do arquivo JSON que será utilizado
FILENAME = 'veiculos_data.json'

class Veiculo:
    def __init__(self, modelo, placa, proprietario, tipo_veiculo):
        self.modelo = modelo
        self.placa = placa
        self.proprietario = proprietario
        self.tipo_veiculo = tipo_veiculo

    def to_dict(self):
        return {
            "modelo": self.modelo,
            "placa": self.placa,
            "proprietario": self.proprietario,
            "tipo_veiculo": self.tipo_veiculo
        }

class SistemaEmplacamento:
    def __init__(self):
        self.veiculos = []
        self.prefixos_placa = ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF", "GGG", "HHH", "III", "JJJ"]
        
        # Carrega dados do arquivo JSON ao iniciar
        self.carregar_dados()

    def cadastrar_veiculo(self, modelo, proprietario, tipo_veiculo):
        # Gerar uma placa aleatória
        placa = self.gerar_placa()
        veiculo = Veiculo(modelo, placa, proprietario, tipo_veiculo)
        self.veiculos.append(veiculo)
        self.salvar_dados()
        print(f"Veículo '{modelo}' de {proprietario} cadastrado com a placa {placa} com sucesso!")

    def gerar_placa(self):
        prefixo = random.choice(self.prefixos_placa)
        numeros = random.randint(1000, 9999)
        return f"{prefixo}-{numeros}"

    def consultar_veiculos(self):
        if not self.veiculos:
            print("Nenhum veículo cadastrado.")
            return
        print("\nVeículos cadastrados:")
        for veiculo in self.veiculos:
            print(f"Modelo: {veiculo.modelo}, Placa: {veiculo.placa}, Proprietário: {veiculo.proprietario}, Tipo: {veiculo.tipo_veiculo}")

    def consultar_veiculo_por_placa(self, placa):
        for veiculo in self.veiculos:
            if veiculo.placa == placa:
                print(f"Veículo encontrado: Modelo: {veiculo.modelo}, Placa: {veiculo.placa}, Proprietário: {veiculo.proprietario}, Tipo: {veiculo.tipo_veiculo}")
                return
        print("Veículo não encontrado.")

    def salvar_dados(self):
        data = {
            "veiculos": [veiculo.to_dict() for veiculo in self.veiculos]
        }
        with open(FILENAME, 'w') as file:
            json.dump(data, file, indent=4)
        print("Dados salvos no arquivo JSON.")

    def carregar_dados(self):
        if os.path.exists(FILENAME):
            with open(FILENAME, 'r') as file:
                data = json.load(file)
                # Carregar veículos
                self.veiculos = [Veiculo(**veiculo) for veiculo in data.get("veiculos", [])]
            print("Dados carregados do arquivo JSON.")

    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')


def main():
    sistema = SistemaEmplacamento()

    while True:
        sistema.clear_screen()
        print("\nMenu Inicial:")
        print("1. Cadastrar novo veículo")
        print("2. Consultar veículos cadastrados")
        print("3. Consultar veículo por placa")
        print("4. Sair")
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == "1":
            modelo = input("Modelo do veículo: ")
            proprietario = input("Proprietário do veículo: ")
            tipo_veiculo = input("Tipo de veículo (Carro, Moto, Caminhão): ")
            sistema.cadastrar_veiculo(modelo, proprietario, tipo_veiculo)
            input("Pressione Enter para continuar...")
        elif opcao == "2":
            sistema.consultar_veiculos()
            input("Pressione Enter para continuar...")
        elif opcao == "3":
            placa = input("Digite a placa do veículo: ")
            sistema.consultar_veiculo_por_placa(placa)
            input("Pressione Enter para continuar...")
        elif opcao == "4":
            print("Saindo do sistema...")
            break
        else:
            print("Opção inválida! Tente novamente.")
            input("Pressione Enter para tentar novamente...")

if __name__ == "__main__":
    main()
