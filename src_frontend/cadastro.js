document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const dob = document.getElementById('dob').value;
    const cpf = document.getElementById('cpf').value;

    console.log("teste");

    try {
        const response = await fetch('http://localhost:3000/api/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, dob, cpf }),
        });

        const data = await response.json();
        document.getElementById('message').innerText = data.message;

        if (response.ok) {
            // Redireciona após 2 segundos
            setTimeout(() => {
                window.location.href = "/login.html"; // Substitua pela URL correta
            }, 2000);
        }
    } catch (error) {
        document.getElementById('message').innerText = "Erro ao cadastrar. Tente novamente.";
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