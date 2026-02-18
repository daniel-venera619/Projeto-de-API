CREATE DATABASE Fiscal;
USE Fiscal;

CREATE TABLE clientes(
	cpf CHAR(11) NOT NULL PRIMARY KEY UNIQUE,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE restaurantes(
	cnpj CHAR(14) PRIMARY KEY NOT NULL UNIQUE,
    nomeFantasia VARCHAR(50) NOT NULL
);

CREATE TABLE cuponsFiscais(
	idCupom INT AUTO_INCREMENT NOT NULL UNIQUE,
    valorTotal DECIMAL(6,2) NOT NULL,
    dataCompra DATE NOT NULL,
    clientesCpf CHAR(11) NOT NULL,
    clientesNome VARCHAR(255) NOT NULL,
    restaurantesNome VARCHAR(255) NOT NULL,
    restaurantesCNPJ CHAR(14) NOT NULL,
    
    PRIMARY KEY(clientesCpf, restaurantesCNPJ, idCupom),
    FOREIGN KEY (clientesCpf) REFERENCES clientes(cpf) ON DELETE CASCADE,
    FOREIGN KEY (restaurantesCNPJ) REFERENCES restaurantes(cnpj) ON DELETE CASCADE
);

SELECT * FROM clientes;

-- Inserindo clientes
INSERT INTO clientes (cpf, nome) VALUES
('12345678901', 'Ana Silva'),
('23456789012', 'Bruno Costa'),
('34567890123', 'Carla Mendes'),
('45678901234', 'Daniel Rocha'),
('56789012345', 'Eduarda Lima');

-- Inserindo restaurantes
INSERT INTO restaurantes (cnpj, nomeFantasia) VALUES
('11111111000101', 'Restaurante Sabor Caseiro'),
('22222222000102', 'Pizzaria Bom Gosto'),
('33333333000103', 'Churrascaria Fogo Alto'),
('44444444000104', 'Lanchonete Fast Bite');

-- Inserindo cupons fiscais
-- os CPFs e CNPJs já existem nas tabelas anteriores (requisito das FKs).
INSERT INTO cuponsFiscais
(valorTotal, dataCompra, clientesNome, clientesCpf, restaurantesNome, restaurantesCNPJ) VALUES
(45.90, '2025-01-10', 'Ana Silva', '12345678901','Restaurante Sabor Caseiro', '11111111000101'),
(78.50, '2025-01-11', 'Bruno Costa', '23456789012', 'Pizzaria Bom Gosto', '22222222000102'),
(120.00, '2025-01-12','Carla Mendes', '34567890123', 'Churrascaria Fogo Alto', '33333333000103'),
(32.75, '2025-01-12', 'Ana Silva', '12345678901', 'Lanchonete Fast Bite', '44444444000104'),
(89.90, '2025-01-13', 'Daniel Rocha', '45678901234', 'Pizzaria Bom Gosto', '22222222000102'),
(150.30, '2025-01-14', 'Eduarda Lima', '56789012345', 'Churrascaria Fogo Alto', '33333333000103');

DROP TABLE cuponsFiscais;

SELECT * FROM clientes;
SELECT * FROM cuponsFiscais;
SELECT * FROM cuponsFiscais WHERE clientesCpf = 12345678901;