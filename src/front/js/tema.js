// =====================================================
// TEMA (claro/escuro) com Persistência
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    
    // Função para aplicar o tema
    const aplicarTema = (tema) => {
        if (tema === 'dark') {
            body.classList.remove('light');
            body.classList.add('dark');
        } else {
            body.classList.remove('dark');
            body.classList.add('light');
        }
        localStorage.setItem('tema_preferido', tema);
    };

    // Carregar tema salvo ou padrão (light)
    const temaSalvo = localStorage.getItem('tema_preferido') || 'light';
    aplicarTema(temaSalvo);

    // Selecionar botões em qualquer página
    const botoesClaro = document.querySelectorAll('.temaBtn.claro');
    const botoesEscuro = document.querySelectorAll('.temaBtn.escuro');

    botoesClaro.forEach(btn => {
        btn.addEventListener('click', () => aplicarTema('light'));
    });

    botoesEscuro.forEach(btn => {
        btn.addEventListener('click', () => aplicarTema('dark'));
    });
});
