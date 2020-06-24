var parametros;

function start(){
    window.addEventListener('load', windowLoaded);
    window.addEventListener('popstate', urlUpdated);
}

function urlUpdated(){
    updateParametros();
}

function $(id){
    return document.getElementById(id);
}

function windowLoaded(){
    updateParametros();

    $('btnJogar').addEventListener('click', function(){
        mudarSecao('cartela', true);

    });

    $('btnCantarNumeros').addEventListener('click', function(){
        mudarSecao('cantar', true);
    });

    atualizaSecao();
}

function atualizaSecao(){
    switch(parametros.mode){
        case 'cantar':
        case 'cartela':
            mudarSecao(parametros.mode);
            break;
        default:
            mudarSecao('start');
            break;
    }
}

function updateParametros(){
    var query = window.location.search,
        params = {};

    if(query){
        if(query[0] == '?')
            query = query.substr(1);

        query.split('&').map(paramValue => paramValue.split('='))
            .forEach(function(paramValue){
                params[paramValue[0]] = paramValue[1];
            });
    }

    parametros = params;
}

function updateUrl(parametros){
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

    history.pushState(null, null, url);
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

start();