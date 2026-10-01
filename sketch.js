// Jogo de Simulador de Fazenda em p5.js

// Variáveis globais para o estado do jogo
let player;
let farmBg, cityBg; // Imagens de fundo
let startBg; // *** NOVO: Imagem de fundo para a tela de início ***
let playerImage; // Variável para a imagem do personagem do jogador

let seeds = []; // Array para armazenar tipos e quantidades de sementes
let inventory = {}; // Objeto para armazenar quantidades de colheitas
let balance = 0; // Saldo em dinheiro do jogador
let currentScreen = "start"; // Jogo começa na tela de início
let prices = {}; // Preços de venda das colheitas
let seedPrices = {}; // Preços de compra das sementes
let seedGrowthTime = 12000; // 12 segundos em milissegundos para testes (originalmente 120000 para 2 minutos)
let cropTypes = []; // Array de todos os tipos de colheita disponíveis
let planted = []; // Array para armazenar colheitas plantadas na fazenda

let farmArea = { x: 200, y: 400, w: 560, h: 200 }; // Área de plantio permitida, agora menor!

// Áreas de interação na cidade
let sellArea = { x: 80, y: 350, w: 200, h: 150 }; // Área para a Loja de Venda (esquerda)
let buySeedArea = { x: 450, y: 350, w: 200, h: 150 }; // Área para a Loja de Sementes (direita)

// Mapeamento das teclas de compra de sementes
const seedBuyKeys = {
    "Tomate": 'Q',
    "Milho": 'W',
    "Cenoura": 'E',
    "Batata": 'B',
    "Alface": 'R',
    "Morango": 'T',
    "Cebola": 'Y',
    "Abóbora": 'U',
    "Trigo": 'I',
    "Beterraba": 'O'
};

// Definindo os arrays de preços fixos completos conforme solicitado
// Preços de compra de sementes, na ordem dos cropTypes
const FIXED_SEED_BUY_PRICES = [
    10,
    1000,
    10000,
    100000,
    1000000,
    10000000,
    100000000,
    1000000000,
    10000000000,
    100000000000
];

// Preços de venda dos alimentos, na ordem dos cropTypes
const FIXED_CROP_SELL_PRICES = [
    100,
    300,
    5000,
    70000,
    900000,
    70000000,
    500000000,
    1000000000,
    30000000000,
    100000000000
];

// Objeto para armazenar URLs de imagem para cada tipo de colheita (semente e cultivada)
const cropImageUrls = {
    "Tomate": {
        seed: "tsemente.jpg", // Semente de tomate
        grown: "tomate.jpg"  // Tomate
    },
    "Milho": {
        seed: "msemente.jpg", // Semente de milho
        grown: "milho.jpg"  // Milho
    },
    "Cenoura": {
        seed: "csemente.jpg", // Semente de cenoura
        grown: "cenoura.jpg"  // Cenoura
    },
    "Batata": {
        seed: "bsemente.jpg", // Semente de batata
        grown: "batata.jpg"  // Batata
    },
    "Alface": {
        seed: "asemente.jpg", // Semente de alface
        grown: "alface.jpg"  // Alface
    },
    "Morango": {
        seed: "mosemente.jpg", // Semente de morango
        grown: "morango.jpg" // Morango
    },
    "Cebola": {
        seed: "cemente.jpg", // Semente de cebola
        grown: "cebola.jpg"  // Cebola
    },
    "Abóbora": {
        seed: "absemente.jpg", // Semente de abóbora
        grown: "abobora.jpg"  // Abóbora
    },
    "Trigo": {
        seed: "trsemente.jpg", // Semente de trigo
        grown: "trigo.jpg"  // Trigo
    },
    "Beterraba": {
        seed: "btsemente.jpg", // Semente de beterraba
        grown: "beterraba.jpg" // Beterraba
    }
};

// Objeto para armazenar objetos p5.Image carregados
let cropImages = {};

// Estado da caixa de mensagem para mensagens personalizadas no jogo
let messageBox = {
    text: "",
    isVisible: false,
    displayUntil: 0
};

// Estado da caixa de ajuda para botões
let helpBox = {
    text: [], // Array de strings para as linhas de texto
    x: 20,
    y: 470, // Posição no canto inferior esquerdo
    w: 180, // Largura
    h: 100, // Altura
};

// Objeto para o botão "Jogar" na tela de início
let playButton = {
    x: 0, y: 0, w: 150, h: 60, // Dimensões do botão (x, y serão calculados em setup)
    text: "Jogar"
};

/**
 * Pré-carrega todos os assets necessários antes do início do jogo.
 * Isso inclui imagens de fundo e todas as imagens de colheitas/sementes.
 */
function preload() {
    farmBg = loadImage("fazenda.jpg"); // Imagem de fundo da fazenda
    cityBg = loadImage("cidade.jpg"); // Imagem de fundo da cidade
    playerImage = loadImage("player.jpg"); // Carrega a imagem do jogador AQUI!
    startBg = loadImage("tela.jpg"); // *** NOVO: Imagem de fundo para a tela de início ***
    // (Pode substituir por uma imagem mais adequada, ex: 'https://i.imgur.com/your-start-screen-image.jpg')


    // Carrega todas as imagens de colheitas e sementes com base em cropImageUrls
    for (const cropType in cropImageUrls) {
        if (cropImageUrls.hasOwnProperty(cropType)) {
            cropImages[cropType] = {
                seed: loadImage(cropImageUrls[cropType].seed),
                grown: loadImage(cropImageUrls[cropType].grown)
            };
        }
    }
}

/**
 * Configura o estado inicial do jogo.
 * Chamado uma vez no início.
 */
function setup() {
    createCanvas(800, 600); // Cria o canvas do jogo
    // Player começa na posição inicial da fazenda, mas só é visível depois de "Jogar"
    player = createVector(width / 2, height / 2 + 50); // Posição inicial na fazenda

    // Calcula a posição do botão "Jogar" para ser centralizado
    playButton.x = width / 2 - playButton.w / 2;
    playButton.y = height / 2 + 50;

    // Define todos os tipos de colheita
    cropTypes = ["Tomate", "Milho", "Cenoura", "Batata", "Alface", "Morango", "Cebola", "Abóbora", "Trigo", "Beterraba"];

    // Inicializa o inventário e DEFINE PREÇOS FIXOS (SEM ALEATÓRIO)
    cropTypes.forEach((crop, index) => {
        inventory[crop] = 0; // Começa com 0 colheitas

        // Atribui os preços de sementes e venda diretamente dos arrays fixos
        seedPrices[crop] = FIXED_SEED_BUY_PRICES[index];
        prices[crop] = FIXED_CROP_SELL_PRICES[index];
    });

    // Dá ao jogador apenas 1 semente de Tomate no início
    seeds = []; // Limpa o array de sementes
    seeds.push({ type: "Tomate", quantity: 1 }); // Adiciona 1 semente de Tomate
}

/**
 * O loop principal do jogo.
 * Chamado continuamente para atualizar e desenhar elementos do jogo.
 */
function draw() {
    background(200); // Limpa o fundo

    // Desenha elementos com base na tela atual
    if (currentScreen === "start") {
        drawStartScreen();
    } else if (currentScreen === "farm") {
        drawFarm();
    } else if (currentScreen === "city") {
        drawCity();
    } else if (currentScreen === "sell") {
        drawSellMenu();
    } else if (currentScreen === "buy") {
        drawBuyMenu();
    }

    // Lógica de movimentação contínua do player no draw()
    // Isso garante que o player se movam enquanto a tecla estiver pressionada
    // Movimento só ocorre na fazenda ou cidade, NÃO na tela de início
    if (currentScreen === "farm" || currentScreen === "city") {
        let moveSpeed = 5; // Velocidade de movimento do jogador

        if (keyIsDown(87)) { // W key (cima)
            player.y -= moveSpeed;
        }
        if (keyIsDown(83)) { // S key (baixo)
            player.y += moveSpeed;
        }
        if (keyIsDown(65)) { // A key (esquerda)
            player.x -= moveSpeed;
        }
        if (keyIsDown(68)) { // D key (direita)
            player.x += moveSpeed;
        }

        // Limita o player à tela
        player.x = constrain(player.x, 0, width);
        player.y = constrain(player.y, 0, height);
    }

    // UI e MessageBox só são desenhados SE NÃO for a tela de início
    if (currentScreen !== "start") {
        drawUI(); // Desenha elementos persistentes da UI (como dinheiro)
        drawMessageBox(); // Desenha qualquer mensagem ativa no jogo
        drawHelpBox(); // Desenha a caixa de ajuda dos botões
    }
}

/**
 * Desenha a tela de início do jogo.
 */
function drawStartScreen() {
    // *** MODIFICADO: Desenha a imagem de fundo da tela de início ***
    image(startBg, 0, 0, width, height); // Desenha a imagem de fundo
    // ***************************************************************

    fill(255); // Cor do texto branca
    textSize(50); // Tamanho grande para o título
    textAlign(CENTER, CENTER); // Centraliza o texto
    text("Simulador de Fazenda", width / 2, height / 2 - 50); // Título um pouco acima do centro

    // Desenha o botão "Jogar"
    fill(50, 200, 50); // Cor verde para o botão
    stroke(255); // Borda branca
    strokeWeight(2);
    rect(playButton.x, playButton.y, playButton.w, playButton.h, 10); // Retângulo arredondado para o botão

    fill(255); // Cor do texto branca
    textSize(28); // Tamanho do texto do botão
    text(playButton.text, playButton.x + playButton.w / 2, playButton.y + playButton.h / 2); // Texto centralizado no botão

    noStroke(); // Reseta o traço
    textAlign(LEFT, BASELINE); // Reseta o alinhamento do texto
}

/**
 * Desenha a tela da fazenda, incluindo fundo, jogador, colheitas plantadas e área de plantio.
 */
function drawFarm() {
    image(farmBg, 0, 0, width, height); // Desenha fundo da fazenda
    fill(0);
    text("Fazenda - Pressione C para ir à cidade", 10, 20);

    // DESENHA A IMAGEM DO PERSONAGEM COM TAMANHO AUMENTADO
    image(playerImage, player.x - 30, player.y - 30, 60, 60);

    drawPlantedCrops();

    // Desenha o retângulo da área de plantio
    noFill();
    stroke(0, 255, 0); // Borda verde
    strokeWeight(2);
    rect(farmArea.x, farmArea.y, farmArea.w, farmArea.h);
    noStroke(); // Reseta o traço
    fill(255);
    text("Área de plantio (Plante com P)", farmArea.x + 10, farmArea.y + 20);

    // Exibe o inventário de sementes atual na tela da fazenda
    let y = 60;
    fill(0);
    text("Sementes:", 10, y);
    y += 20;
    seeds.forEach(seed => {
        if (seed.quantity > 0) {
            text(`${seed.type}: ${seed.quantity}`, 10, y);
            y += 20;
        }
    });

    // Atualiza o texto da caixa de ajuda para a fazenda
    helpBox.text = [
        "Controles da Fazenda:",
        "W,A,S,D: Mover",
        "P: Plantar",
        "Clique: Colher",
        "C: Ir para a Cidade"
    ];
}

/**
 * Desenha a tela da cidade, incluindo fundo e instruções de navegação.
 */
function drawCity() {
    image(cityBg, 0, 0, width, height); // Desenha fundo da cidade
    fill(0);
    text("Cidade - Pressione F para voltar à fazenda", 10, 20);
    text("Mova o player para a loja!", 10, 40);

    // Desenha as áreas das lojas na cidade
    // Loja de Venda
    noFill();
    stroke(255, 0, 0); // Borda vermelha para a loja de venda
    strokeWeight(2);
    rect(sellArea.x, sellArea.y, sellArea.w, sellArea.h);
    fill(0);
    text("V: Loja de Venda", sellArea.x + 10, sellArea.y + 20);
    // Loja de Sementes
    noFill();
    stroke(0, 0, 255); // Borda azul para a loja de sementes
    strokeWeight(2);
    rect(buySeedArea.x, buySeedArea.y, buySeedArea.w, buySeedArea.h);
    fill(0);
    text("M: Loja de Sementes", buySeedArea.x + 10, buySeedArea.y + 20);
    noStroke(); // Reseta o traço

    // Desenha o player na cidade (sempre, já que ele está na tela da cidade)
    image(playerImage, player.x - 30, player.y - 30, 60, 60); // Player também é desenhado na cidade

    // Atualiza o texto da caixa de ajuda para a cidade
    helpBox.text = [
        "Controles da Cidade:",
        "W,A,S,D: Mover",
        "F: Voltar para a Fazenda",
        "V: Loja de Venda (na área)",
        "M: Loja de Sementes (na área)"
    ];
}

/**
 * Desenha o menu de venda, exibindo inventário e opções de venda.
 */
function drawSellMenu() {
    fill(255, 255, 255, 200); // Fundo branco semi-transparente para o menu
    rect(50, 50, 700, 500, 20); // Retângulo arredondado para o menu
    fill(0);
    textSize(20);
    text("Loja de Vendas - Pressione X para sair", 60, 70);
    textSize(14); // Reseta o tamanho do texto

    let y = 100;
    let hasCropsToSell = false;
    cropTypes.forEach(crop => {
        if (inventory[crop] > 0) {
            hasCropsToSell = true;
            text(`${crop}: ${inventory[crop]} x ${formatCurrency(prices[crop])} = ${formatCurrency(inventory[crop] * prices[crop])}`, 60, y);
            y += 20;
        }
    });

    if (hasCropsToSell) {
        text("Pressione S para vender tudo", 60, y + 20); // 'S' agora vende tudo dentro do menu
    } else {
        text("Você não tem nada para vender.", 60, y + 20);
    }

    // Atualiza o texto da caixa de ajuda para o menu de venda
    helpBox.text = [
        "Controles da Venda:",
        "X: Sair para a Cidade",
        "S: Vender Tudo"
    ];
}

/**
 * Desenha o menu de compra (loja de sementes), exibindo sementes disponíveis e opções de compra.
 */
function drawBuyMenu() {
    fill(255, 255, 255, 200); // Fundo branco semi-transparente para o menu
    rect(50, 50, 700, 500, 20); // Retângulo arredondado para o menu
    fill(0);
    textSize(20);
    text("Loja de Sementes - Pressione X para sair", 60, 70);
    textSize(14); // Reseta o tamanho do texto

    let y = 100;
    cropTypes.forEach(crop => {
        const keyToBuy = seedBuyKeys[crop];
        text(`${crop}: ${formatCurrency(seedPrices[crop])} (Pressione ${keyToBuy} para comprar)`, 60, y);
        y += 20;
    });

    // Atualiza o texto da caixa de ajuda para o menu de compra
    helpBox.text = [
        "Controles da Compra:",
        "X: Sair para a Cidade",
        "Q,W,E,B,R,T,Y,U,I,O:",
        "  Comprar Semente"
    ];
}

/**
 * Desenha elementos persistentes da UI, como o saldo em dinheiro do jogador.
 */
function drawUI() {
    fill(255, 255, 200, 200); // Fundo amarelo claro semi-transparente para exibição de dinheiro
    rect(width - 160, 10, 150, 30, 10); // Retângulo arredondado
    fill(0);
    text(`Dinheiro: ${formatCurrency(balance)}`, width - 150, 30);
}

/**
 * Função auxiliar para verificar se o jogador está dentro de uma área.
 * @param {object} area - Objeto com propriedades x, y, w, h que definem a área.
 * @returns {boolean} True se o jogador estiver dentro da área, caso contrário False.
 */
function isPlayerInArea(area) {
    // Considerando o centro do player (player.x, player.y) para detecção de colisão
    // A imagem do player é 60x60, então o ponto central é o que importa para a colisão com a área
    return player.x > area.x && player.x < area.x + area.w &&
           player.y > area.y && player.y < area.y + area.h;
}

/**
 * Lida com eventos de pressionamento de tecla para navegação e ações (ações não contínuas).
 */
function keyPressed() {
    // Sem ações de tecla na tela de início, exceto clique do mouse
    if (currentScreen === "farm") {
        if (key === 'C' || key === 'c') currentScreen = "city"; // Ir para a cidade
        if (key === 'P' || key === 'p') plantCrop(); // Plantar uma colheita
    } else if (currentScreen === "city") {
        if (key === 'F' || key === 'f') currentScreen = "farm"; // Voltar para a fazenda

        // Abertura das lojas baseada na posição do player
        if (key === 'V' || key === 'v') { // Abrir loja de venda
            if (isPlayerInArea(sellArea)) {
                currentScreen = "sell";
            } else {
                showMessage("Aproxime-se da Loja de Venda para entrar!");
            }
        }
        if (key === 'M' || key === 'm') { // Abrir loja de sementes
            if (isPlayerInArea(buySeedArea)) {
                currentScreen = "buy";
            } else {
                showMessage("Aproxime-se da Loja de Sementes para entrar!");
            }
        }

    } else if (currentScreen === "sell") {
        if (key === 'X' || key === 'x') currentScreen = "city"; // Sair do menu de venda
        if (key === 'S' || key === 's') sellAllCrops(); // 'S' agora vende tudo dentro do menu
    } else if (currentScreen === "buy") {
        if (key === 'X' || key === 'x') currentScreen = "city"; // Sair do menu de compra

        // Lógica de compra de sementes usando o novo mapeamento
        for (let i = 0; i < cropTypes.length; i++) {
            const crop = cropTypes[i];
            const assignedKey = seedBuyKeys[crop]; // Pega a tecla atribuída para esta colheita

            if (key.toUpperCase() === assignedKey) { // Compara a tecla pressionada com a tecla atribuída
                buySeed(crop);
                break; // Comprou uma semente, pode sair do loop
            }
        }
    }
}

/**
 * Lida com eventos de pressionamento do mouse, principalmente para colher colheitas maduras.
 */
function mousePressed() {
    // Adicionado tratamento de clique para o botão "Jogar"
    if (currentScreen === "start") {
        // Verifica se o clique foi dentro do botão "Jogar"
        if (mouseX > playButton.x && mouseX < playButton.x + playButton.w &&
            mouseY > playButton.y && mouseY < playButton.y + playButton.h) {
            currentScreen = "farm"; // Mudar para a tela da fazenda
            return; // Sair da função para não processar outros cliques
        }
    }

    // O restante da lógica de mousePressed() para colheita continua aqui
    for (let i = planted.length - 1; i >= 0; i--) {
        // Verifica se o clique do mouse está dentro da área de colheita da colheita e se ela está madura
        if (dist(mouseX, mouseY, planted[i].x, planted[i].y) < 15 && // Área de clique ligeiramente aumentada
            millis() - planted[i].plantedAt > seedGrowthTime) {
            inventory[planted[i].type]++; // Adiciona ao inventário
            showMessage(`Colheu 1 ${planted[i].type}!`); // Exibe mensagem de colheita
            planted.splice(i, 1); // Remove do array plantado
            break; // Colhe apenas uma colheita por clique
        }
    }
}

/**
 * Planta uma colheita na posição atual do jogador se estiver dentro da área da fazenda e houver sementes disponíveis.
 */
function plantCrop() {
    // Verifica se o jogador está dentro da área de plantio designada
    if (player.x >= farmArea.x && player.x <= farmArea.x + farmArea.w &&
        player.y >= farmArea.y && player.y <= farmArea.y + farmArea.h) {

        // Encontra o primeiro tipo de semente disponível com quantidade > 0
        let seed = seeds.find(s => s.quantity > 0);
        if (seed) {
            seed.quantity--; // Diminui a quantidade de sementes
            // Adiciona a colheita plantada ao array 'planted'
            planted.push({
                type: seed.type,
                x: player.x,
                y: player.y,
                plantedAt: millis() // Registra o tempo de plantio
            });
            showMessage(`Plantou uma ${seed.type}!`); // Exibe mensagem de confirmação
        } else {
            showMessage("Você não tem sementes para plantar!"); // Mensagem de sem sementes
        }
    } else {
        showMessage("Você só pode plantar dentro da área de plantio!"); // Mensagem de fora da área de plantio
    }
}

/**
 * Desenha todas as colheitas plantadas na fazenda, mostrando a imagem da semente ou da colheita cultivada com base no tempo de crescimento.
 */
function drawPlantedCrops() {
    for (let crop of planted) {
        let imageToDraw;
        // Verifica se a colheita cresceu
        if (millis() - crop.plantedAt > seedGrowthTime) {
            imageToDraw = cropImages[crop.type].grown; // Usa a imagem da colheita cultivada
        } else {
            imageToDraw = cropImages[crop.type].seed; // Usa a imagem da semente
        }
        // Desenha a imagem apropriada na posição da colheita
        image(imageToDraw, crop.x - 10, crop.y - 10, 20, 20); // Ajusta a posição para centralizar a imagem no local de plantio do jogador
    }
}

/**
 * Vende todas as colheitas colhidas no inventário e adiciona o valor total ao saldo.
 */
function sellAllCrops() {
    let total = 0;
    let cropsSoldCount = 0;
    cropTypes.forEach(crop => {
        if (inventory[crop] > 0) {
            total += inventory[crop] * prices[crop];
            cropsSoldCount += inventory[crop];
            inventory[crop] = 0; // Limpa o inventário para essa colheita
        }
    });
    balance += total; // Adiciona os ganhos totais ao saldo
    if (cropsSoldCount > 0) {
        showMessage(`Vendeu ${cropsSoldCount} itens por ${formatCurrency(total)}!`);
    } else {
        showMessage("Você não tem nada para vender.");
    }
}

/**
 * Compra uma semente de um tipo de colheita especificado se o jogador tiver dinheiro suficiente.
 * @param {string} crop - O tipo de semente de colheita a ser comprada.
 */
function buySeed(crop) {
    if (balance >= seedPrices[crop]) {
        balance -= seedPrices[crop]; // Deduz o custo do saldo
        let existing = seeds.find(s => s.type === crop); // Encontra a entrada de semente existente
        if (existing) {
            existing.quantity++; // Incrementa a quantidade se o tipo de semente já existir
        } else {
            seeds.push({ type: crop, quantity: 1 }); // Adiciona um novo tipo de semente se não existir
        }
        showMessage(`Comprou 1 semente de ${crop}!`); // Exibe mensagem de confirmação
    } else {
        showMessage(`Dinheiro insuficiente para comprar semente de ${crop}!`); // Mensagem de fundos insuficientes
    }
}

/**
 * Exibe uma mensagem temporária na tela.
 * @param {string} message - A mensagem a ser exibida.
 */
function showMessage(message) {
    messageBox.text = message;
    messageBox.isVisible = true;
    messageBox.displayUntil = millis() + 3000; // Exibe por 3 segundos
}

/**
 * Desenha a caixa de mensagem ativa na tela.
 */
function drawMessageBox() {
    if (messageBox.isVisible) {
        // Oculta a mensagem se o tempo de exibição tiver passado
        if (millis() > messageBox.displayUntil) {
            messageBox.isVisible = false;
            messageBox.text = "";
        } else {
            // Desenha o fundo da caixa de mensagem
            fill(255, 255, 200, 200); // Amarelo claro semi-transparente
            rectMode(CENTER); // Desenha o retângulo a partir do seu centro
            // Calcula a largura do texto para ajustar o tamanho da caixa
            let messageWidth = textWidth(messageBox.text);
            rect(width / 2, height - 50, messageWidth + 40, 40, 10); // Retângulo arredondado

            // Desenha o texto da mensagem
            fill(0);
            textAlign(CENTER, CENTER); // Centraliza o texto dentro da caixa
            text(messageBox.text, width / 2, height - 50);

            // Reseta os modos de desenho do p5.js para o padrão
            textAlign(LEFT, BASELINE);
            rectMode(CORNER);
        }
    }
}

/**
 * Desenha a caixa de ajuda com os botões atuais do jogo.
 */
function drawHelpBox() {
    fill(0, 0, 0, 150); // Fundo preto semi-transparente
    rect(helpBox.x, helpBox.y, helpBox.w, helpBox.h, 10); // Retângulo arredondado para a caixa de ajuda

    fill(255); // Texto branco
    textSize(12); // Tamanho menor para o texto da ajuda
    let textX = helpBox.x + 10;
    let textY = helpBox.y + 20;
    let lineHeight = 15; // Espaçamento entre as linhas

    // Desenha cada linha de texto da helpBox
    for (let i = 0; i < helpBox.text.length; i++) {
        text(helpBox.text[i], textX, textY + (i * lineHeight));
    }
}

/**
 * Função auxiliar para formatar valores monetários em Real (R$).
 * @param {number} amount - O valor numérico a ser formatado.
 * @returns {string} O valor formatado como string em moeda brasileira.
 */
function formatCurrency(amount) {
    // Usa Number.prototype.toLocaleString() para formatação correta do Real brasileiro
    // 'pt-BR' para o locale Português (Brasil)
    // 'currency' para formatar como moeda
    // 'BRL' para especificar o Real brasileiro
    // minimumFractionDigits e maximumFractionDigits garantem duas casas decimais
    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}