let usuarios;
let adm = ["12321213499", "12345678955", "45365417288"]

// PARA PEGAR TODOS OS USUÁRIOS CADASTRADOS NO BD
async function fetchUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/api/usuarios', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            // Exibe a lista de usuários no console ou em um elemento HTML
            usuarios = data;
            console.log(usuarios); // ou manipule o DOM para exibir os dados
        } else {
            document.getElementById('message').innerText = data.message || 'Erro ao buscar usuários.';
        }
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        document.getElementById('message').innerText = 'Erro ao buscar usuários. Tente novamente.';
    }
}

// Chame a função para executar
fetchUsuarios();

// localStorage.clear();

// CPF PARA LOGIN
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const cpf = document.getElementById('cpf');
    let usuarioEncontrado = false;

    // CPF: traz do banco de dados
    // cpf: no momento do cadastro
    for (let i = 0; usuarios.length > i; i++) {
        if (usuarios[i].CPF === cpf.value) {
            usuarioEncontrado = true;  // CPF encontrado, alteramos a variável

            // Verifica se é administrador
            for (let j = 0; adm.length > j; j++) {
                if (adm[j] === cpf.value) {
                    // Passar os dados para verificar se usuário está cadastrado como admin
                    localStorage.setItem("USUARIO_ID", usuarios[i].ID);
                    window.location.href = "controleGrh.html";
                    return;
                }
            }

            // Caso não seja admin, redireciona para página do usuário
            localStorage.setItem("USUARIO_ID", usuarios[i].ID);
            console.log(localStorage);
            window.location.href = "catracaUser.html";
            return;
        }
    }

    // Se o CPF não foi encontrado no loop
    if (!usuarioEncontrado) {
        // Exibe mensagem de erro para CPF não encontrado
        document.getElementById('message').innerText = "CPF não cadastrado!";
        cpf.style.border="1px solid red";
    }

    // Limpa os campos do formulário
    this.reset();
});

// DIA SEMANA + DIA + SAUDAÇÃO
let diaS = document.getElementById("diaS");
let diaN = document.getElementById("diaN");
let periodo = document.getElementById("periodo");


function obterDataHoraAtual() {
    // Criando um objeto Date para obter a data e hora atuais
    const agora = new Date();

    // Arrays para os dias da semana e períodos do dia
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Obtendo o dia da semana (0 a 6) e o dia do mês (1 a 31)
    const diaSemana = diasDaSemana[agora.getDay()];
    const dia = agora.getDate();

    // Obtendo a hora atual (de 0 a 23)
    const hora = agora.getHours();

    // const minuto = agora.getMinutes();

    // Determinando o período do dia (Manhã, Tarde ou Noite)
    let saudacao;
    if (hora >= 0 && hora <= 11) saudacao = 'Bom dia';  // De 00:00 a 11:59 é manhã
    else if (hora >= 12 && hora <= 17) saudacao = 'Boa tarde';  // De 12:00 a 17:59 é tarde
    else saudacao = 'Boa noite';  // De 18:00 a 23:59 é noite

    // Atualizando os elementos HTML com as informações
    diaS.innerHTML = diaSemana;  // Exibe o nome do dia da semana (ex: Qui)
    diaN.innerHTML = dia;  // Exibe o número do dia (ex: 28)
    periodo.innerHTML = saudacao;  // Exibe a saudação (ex: Bom dia, Boa tarde, Boa noite)
    
    // Chama a função ao carregar a página para exibir a data e a saudação
    window.onload = obterDataHoraAtual;
}

console.log(obterDataHoraAtual()); 

