// ========================================
// Equipe África - Sistema de Som
// ========================================


// ========================================
// CONFIGURAÇÕES
// ========================================

const VOLUME = 0.8;

const TEMPO_FADE = 2000;

const TEMPO_ESPERA = 1000;


// ========================================
// ARQUIVOS DE ÁUDIO
// ========================================

const sons = {
    entrada: "assets/sounds/entrada.mp4",
    trilha1: "assets/sounds/trilha1.mp4",
    trilha2: "assets/sounds/trilha2.mp3"
};


// ========================================
// NOMES DAS MÚSICAS
// ========================================

const nomesDosSons = {
    entrada: "Música de Entrada",
    trilha1: "Trilha Sonora 1",
    trilha2: "Trilha Sonora 2"
};


// ========================================
// ÁUDIO ATUAL
// ========================================

let audioAtual = null;

let nomeSomAtual = null;

let fadeAtual = null;


// ========================================
// NOTIFICAÇÃO
// ========================================

function mostrarNotificacao(nomeDoSom) {

    const notificacao =
        document.getElementById("nowPlaying");

    const titulo =
        document.getElementById("nowPlayingTitle");


    titulo.textContent =
        nomesDosSons[nomeDoSom];


    notificacao.classList.add("is-visible");
}


function esconderNotificacao() {

    const notificacao =
        document.getElementById("nowPlaying");

    notificacao.classList.remove("is-visible");
}


// ========================================
// PARAR UM ÁUDIO IMEDIATAMENTE
// ========================================

function pararAudio(audio) {

    if (!audio) {
        return;
    }

    audio.pause();

    audio.currentTime = 0;

    audio.volume = 0;
}


// ========================================
// TOCAR SOM
// ========================================

function tocarSom(nomeDoSom) {

    // Se apertar o mesmo botão novamente,
    // não cria outro áudio.

    if (nomeSomAtual === nomeDoSom && audioAtual) {
        return;
    }


    // Cancela qualquer fade anterior.

    if (fadeAtual) {

        cancelAnimationFrame(fadeAtual);

        fadeAtual = null;
    }


    // Guarda o áudio antigo.

    const audioAntigo = audioAtual;


    // Cria o novo áudio.

    const novoAudio =
        new Audio(sons[nomeDoSom]);

    novoAudio.controls = false;

    novoAudio.loop = true;

    novoAudio.currentTime = 0;

    novoAudio.volume = 0;


    // Atualiza o áudio atual.

    audioAtual = novoAudio;

    nomeSomAtual = nomeDoSom;


    // Mostra a notificação.

    mostrarNotificacao(nomeDoSom);


    // ========================================
    // SE NÃO EXISTIA ÁUDIO
    // ========================================

    if (!audioAntigo) {

        novoAudio.play().catch(() => {

            console.log(
                "Não foi possível iniciar o áudio."
            );

        });


        const inicio = performance.now();


        function fadeIn(tempoAtual) {

            const progresso = Math.min(
                (tempoAtual - inicio) / TEMPO_FADE,
                1
            );


            novoAudio.volume = Math.min(
                1,
                VOLUME * progresso
            );


            if (progresso < 1) {

                fadeAtual =
                    requestAnimationFrame(fadeIn);

            } else {

                fadeAtual = null;

                novoAudio.volume = VOLUME;
            }
        }


        fadeAtual =
            requestAnimationFrame(fadeIn);

        return;
    }


    // ========================================
    // TROCA DE MÚSICA
    // ========================================

    const inicio = performance.now();


    function trocarMusica(tempoAtual) {

        const tempoPassado =
            tempoAtual - inicio;


        // ====================================
        // PRIMEIRO SEGUNDO
        //
        // Música antiga:
        // 100% → 50%
        // ====================================

        if (tempoPassado < TEMPO_ESPERA) {

            const progresso =
                tempoPassado / TEMPO_ESPERA;


            audioAntigo.volume = Math.max(
                0,
                VOLUME * (1 - progresso * 0.5)
            );


            fadeAtual =
                requestAnimationFrame(trocarMusica);

            return;
        }


        // ====================================
        // COMEÇA A NOVA MÚSICA
        // ====================================

        if (!novoAudio.started) {

            novoAudio.started = true;

            novoAudio.currentTime = 0;

            novoAudio.volume = 0;


            novoAudio.play().catch(() => {

                console.log(
                    "Não foi possível iniciar o áudio."
                );

            });
        }


        // ====================================
        // SEGUNDO SEGUNDO
        //
        // Antiga:
        // 50% → 0%
        //
        // Nova:
        // 0% → 100%
        // ====================================

        const progresso =
            (tempoPassado - TEMPO_ESPERA) /
            (TEMPO_FADE - TEMPO_ESPERA);


        audioAntigo.volume = Math.max(
            0,
            VOLUME * (0.5 - progresso * 0.5)
        );


        novoAudio.volume = Math.min(
            1,
            VOLUME * progresso
        );


        // ====================================
        // TERMINOU
        // ====================================

        if (progresso < 1) {

            fadeAtual =
                requestAnimationFrame(trocarMusica);

        } else {

            fadeAtual = null;


            // Mata completamente a música antiga.

            pararAudio(audioAntigo);


            // Garante o volume final.

            novoAudio.volume = VOLUME;
        }
    }


    fadeAtual =
        requestAnimationFrame(trocarMusica);
}


// ========================================
// PARAR SOM
// ========================================

function pararSom() {

    if (!audioAtual) {
        return;
    }


    // Cancela qualquer fade.

    if (fadeAtual) {

        cancelAnimationFrame(fadeAtual);

        fadeAtual = null;
    }


    const audio = audioAtual;

    const volumeInicial = audio.volume;

    const inicio = performance.now();


    function fadeOut(tempoAtual) {

        const progresso = Math.min(
            (tempoAtual - inicio) / TEMPO_FADE,
            1
        );


        audio.volume = Math.max(
            0,
            volumeInicial * (1 - progresso)
        );


        if (progresso < 1) {

            fadeAtual =
                requestAnimationFrame(fadeOut);

        } else {

            fadeAtual = null;


            pararAudio(audio);


            audioAtual = null;

            nomeSomAtual = null;

            esconderNotificacao();
        }
    }


    fadeAtual =
        requestAnimationFrame(fadeOut);
}


// ========================================
// BOTÕES
// ========================================

const entradaButton =
    document.getElementById("entradaButton");

const trilha1Button =
    document.getElementById("trilha1Button");

const trilha2Button =
    document.getElementById("trilha2Button");

const stopButton =
    document.getElementById("stopButton");


// ========================================
// MÚSICA DE ENTRADA
// ========================================

entradaButton.addEventListener("click", function () {

    tocarSom("entrada");

});


// ========================================
// TRILHA SONORA 1
// ========================================

trilha1Button.addEventListener("click", function () {

    tocarSom("trilha1");

});


// ========================================
// TRILHA SONORA 2
// ========================================

trilha2Button.addEventListener("click", function () {

    tocarSom("trilha2");

});


// ========================================
// PARAR
// ========================================

stopButton.addEventListener("click", function () {

    pararSom();

});


// ========================================
// SEGURANÇA
// ========================================

window.addEventListener("pagehide", function () {

    if (audioAtual) {

        pararAudio(audioAtual);

        audioAtual = null;

        nomeSomAtual = null;
    }
});