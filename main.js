var parametros;
var numeros = [];

function start(){
    window.addEventListener('load', windowLoaded);
    window.addEventListener('popstate', urlUpdated);
}

function urlUpdated(){
    updateParametros();
    atualizaSecao();
}

function $(id){
    return document.getElementById(id);
}

function windowLoaded(){
    updateParametros();

    $('btnJogar').addEventListener('click', function(){
        mudarSecao('cartela', true);
        iniciaCartela(true);
    });

    $('btnCantarNumeros').addEventListener('click', function(){
        mudarSecao('cantar', true);
        iniciaCantar(true);
    });

    $('btnNovoNumero').addEventListener('click', function(){
        sortearNumero();
    });

    $('novaCartela').addEventListener('click', function(){
        iniciaCartela(true);
    });

    $('btnResetarSorteio').addEventListener('click', function(){
        if(confirm('Os número já sorteado voltarão para o saco, deseja mesmo recomeçar?'))
            iniciaCantar(true);
    });

    document.querySelectorAll('#cartela_bingo td').forEach(function(celula){
        celula.addEventListener('click', celulaClicada);
    });

    atualizaSecao();
}

function iniciaCantar(zerar){
    var cantados = [];
    
    document.querySelectorAll('#sorteados li').forEach(function(li){
        li.classList.remove('marcado');
    });

    numeros = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
        16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
        31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,
        46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,
        61,62,63,64,65,66,67,68,69,70,71,72,73,74,75]; 

    if(!zerar && parametros.cantados){
        var cantados = JSON.parse(atob(parametros.cantados));
        cantados.forEach(function(numero){
            marcarSorteado(numero);
            numeros.splice(numeros.indexOf(numero), 1);
        });

        if(cantados.length)
            atualizaNumeroSorteado(cantados[cantados.length-1]);
    }



    if(zerar || !parametros.cantados){
        parametros.cantados = btoa(JSON.stringify([]));
        sortearNumero();
    }

    
}

function falar(mensagem){
    if(window.speechSynthesis){
        var utter = new SpeechSynthesisUtterance(mensagem);
        utter.lang = "pt-BR";
        utter.rate = 0.9;
        window.speechSynthesis.speak(utter);
    }
}

function marcarSorteado(numero){
    var lista = coluna(numero);
    var item = ((numero - 1) % 15) + 2;

    var li = document.querySelector('#sorteados>ul:nth-child('+lista+')>li:nth-child('+item+')');

    li.classList.add('marcado');
}

function sortearNumero(){
    
    if(!numeros.length)
        return;

    var cantados = JSON.parse(atob(parametros.cantados)),
        numero;
    do {
        numeros = shuffle(numeros);
        numero = numeros.pop()
    }while(cantados.indexOf(numero) !== -1 && numeros.length)
    
    cantados.push(numero);

    atualizaNumeroSorteado(numero);

    marcarSorteado(numero);

    parametros.cantados = btoa(JSON.stringify(cantados));

    updateUrl(parametros, true);

    cantarNumero(numero);

}

var frasesPorNumero = {
    1 : "Começou o jogo",
    2 : "Um patinho na lagoa",
    10: "Raso",
    12: "A vitamina",
    20: "Raso",
    22: "Dois patinhos na lagoa",
    25: "É natal",
    30: "Raso",
    33: "A idade de cristo",
    40: "Raso",
    50: "Raso",
    51: "Uma boa ideia",
    60: "Raso",
    70: "Raso",
    75: "Fim de jogo"
};

var falarFraseThreshold = 0.5;

function cantarNumero(numero){
    var coluna = letraColuna(numero).replace("O", "Ó").replace("I", " i");
    var frase = frasesPorNumero[numero];
    var mensagem;

    if(frase){
        var falarFrase = Math.random() > falarFraseThreshold;
        if(falarFrase)
            falarFraseThreshold = 0.5;
        else
            falarFraseThreshold -= 0.1;

        if(falarFrase){
            var posicao = Math.random();
            if(posicao < 0.33)
                mensagem = `${frase}, ${coluna} ${numero}`;
            else if(posicao < 0.66)
                mensagem = `${coluna}, ${frase}, ${numero}`;
            else
                mensagem = `${coluna} ${numero}, ${frase}`;
        }            
    }    

    if(!mensagem)
        mensagem = `${coluna} ${numero}`;

    falar(mensagem);
}

function coluna(numero){
    if(numero < 16)
        return 1;
    
    if (numero < 31)
        return 2;
    
    if (numero < 46)
        return 3;
    
    if (numero < 61)
        return 4;
    
    return 5;
}

function letraColuna(numero){
    return 'BINGO'.charAt(coluna(numero)-1);
}

function atualizaNumeroSorteado(numero){
    $('sorteado').innerText = letraColuna(numero) + ' ' + numero;
}

function atualizaSecao(){
    var secao = parametros.mode;

    switch(parametros.mode){
        case 'cantar':
            iniciaCantar();
            break;
        case 'cartela':
            iniciaCartela();
            break;
        default:
            secao = 'start';
            break;
    }

    mudarSecao(secao);
}

function updateParametros(){
    var query = window.location.search,
        params = {};

    if(query){
        if(query[0] == '?')
            query = query.substr(1);

        query.split('&').map(paramValue => paramValue.split('='))
            .forEach(function(paramValue){
                params[paramValue[0]] = decodeURIComponent(paramValue[1]);
            });
    }

    parametros = params;
}

function updateUrl(parametros, sobrescrever){
    var url = document.location.origin + document.location.pathname + '?';
    var primeiro = true;
    for(var p in parametros){
        if(parametros.hasOwnProperty(p)){

            if(!primeiro)
                url += '&';

            url += encodeURIComponent(p) + '=' + encodeURIComponent(parametros[p]);

            if(primeiro)
                primeiro = false;
        }
    }

    if(!sobrescrever)
        history.pushState(null, null, url);
    else
        history.replaceState(null, null, url);

    updateParametros();
}

function mudarSecao(secao, atualizaUrl){
    document.querySelectorAll('.secao').forEach(function(secao){
        secao.style.display = '';
    });

    $(secao).style.display = 'block';

    if(atualizaUrl){
        updateUrl({
            mode: secao
        });
    }
}

function iniciaCartela(forcarNova){
    var cartela,
        novaCartela = true,
        marcados = [];

    forcarNova = !!forcarNova;

    if(parametros.cartela && !forcarNova){
        cartela = JSON.parse(atob(parametros.cartela))
        novaCartela = false;

        if(parametros.marcados)
            marcados = JSON.parse(atob(parametros.marcados));
    }

    var nova = atualizaCartela(cartela, marcados);

    if(novaCartela){
        updateUrl(gerarParametros({
            cartela: btoa(JSON.stringify(nova)),
            marcados: btoa(JSON.stringify(marcados))
        }), !forcarNova);
    }
}

function celulaClicada(event){
    var celula = event.target;
    
    var marcado = celula.classList.toggle('marcado');
    
    if(celula.id != 'joker'){
        var marcados = JSON.parse(atob(parametros.marcados));
        if(!marcado){
            var index = marcados.indexOf(parseInt(celula.innerText));
            if(index > -1)
                marcados.splice(index, 1);
        }
        else{
            marcados.push(parseInt(celula.innerText));
        }

        parametros.marcados = btoa(JSON.stringify(marcados));
        updateUrl(parametros, true);
    }
}

function atualizaCartela(cartela, marcados){
    if(!cartela){
        var colunas = [
            [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
            [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
            [31,32,33,34,35,36,37,38,39,40,41,42,43,44,45],
            [46,47,48,49,50,51,52,53,54,55,56,57,58,59,60],
            [61,62,63,64,65,66,67,68,69,70,71,72,73,74,75]
        ];

        cartela = colunas.map(function(coluna){
            return shuffle(coluna).slice(0, 5);
        });
    }

    document.querySelectorAll('#cartela_bingo td').forEach(function(celula, index){
        var celulaLinha = Math.floor(index / 5),
            celulaColuna = index % 5,
            valor = cartela[celulaColuna][celulaLinha];

        if(marcados && marcados.indexOf(valor) > -1)
            celula.classList.add('marcado');
        else
            celula.classList.remove('marcado');

        if(celulaLinha != 2 || celulaColuna != 2){
            celula.innerText = valor;
        }
    });

    return cartela;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

function gerarParametros(parametrosAdicionais, mode){
    var novosParametros = {
        mode: mode || parametros.mode,
    };

    for(var p in parametrosAdicionais){
        if(parametrosAdicionais.hasOwnProperty(p))
            novosParametros[p] = parametrosAdicionais[p];
    }

    return novosParametros;
}

start();