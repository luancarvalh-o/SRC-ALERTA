(() => {
  const form = document.getElementById('reportForm');
  const inputFoto = document.getElementById('foto');
  const uploadArea = document.getElementById('uploadArea');
  const uploadEmpty = document.getElementById('uploadEmpty');
  const uploadPreview = document.getElementById('uploadPreview');
  const previewImage = document.getElementById('previewImage');
  const removeImage = document.getElementById('removeImage');
  const descricao = document.getElementById('descricao');
  const charCount = document.getElementById('charCount');
  const message = document.getElementById('formMessage');
  const submitButton = document.getElementById('submitReport');

  let arquivoFoto = null;
  let previewUrl = '';

  CloudDB.getSession().then(session => {
    if (!session) {
      mostrarMensagem('Faça login para registrar um problema.', 'error');
      submitButton.textContent = 'Entrar para enviar denúncia';
      submitButton.type = 'button';
      submitButton.addEventListener('click', () => {
        location.href = 'login.html';
      });
      return;
    }
    document.getElementById('btnNavPerfil').textContent = 'Meu Perfil';
    document.getElementById('btnNavPerfil').parentElement.href = 'perfil.html';
  });

  descricao.addEventListener('input', () => {
    charCount.textContent = descricao.value.length;
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, event => {
      event.preventDefault();
      uploadArea.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, event => {
      event.preventDefault();
      uploadArea.classList.remove('dragging');
    });
  });

  uploadArea.addEventListener('drop', event => {
    const [file] = event.dataTransfer.files;
    if (file) processarImagem(file);
  });

  inputFoto.addEventListener('change', () => {
    const [file] = inputFoto.files;
    if (file) processarImagem(file);
  });

  removeImage.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    limparImagem();
  });

  function processarImagem(file) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      mostrarMensagem('Use uma imagem PNG, JPG ou WEBP.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      mostrarMensagem('A imagem deve ter no máximo 10 MB.', 'error');
      return;
    }

    limparPreviewUrl();
    arquivoFoto = file;
    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    uploadEmpty.hidden = true;
    uploadPreview.hidden = false;
    limparMensagem();
  }

  function limparPreviewUrl() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
  }

  function limparImagem() {
    limparPreviewUrl();
    arquivoFoto = null;
    inputFoto.value = '';
    previewImage.removeAttribute('src');
    uploadPreview.hidden = true;
    uploadEmpty.hidden = false;
  }

  function mostrarMensagem(texto, tipo) {
    message.textContent = texto;
    message.className = `form-message ${tipo}`;
  }

  function limparMensagem() {
    message.textContent = '';
    message.className = 'form-message';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    limparMensagem();

    const dados = {
      categoria: document.getElementById('categoria').value,
      titulo: document.getElementById('titulo').value.trim(),
      descricao: descricao.value.trim(),
      endereco: document.getElementById('endereco').value.trim(),
      bairro: document.getElementById('bairro').value.trim(),
    };

    if (Object.values(dados).some(valor => !valor)) {
      mostrarMensagem('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (dados.titulo.length < 3) {
      mostrarMensagem('O título precisa ter pelo menos 3 caracteres.', 'error');
      return;
    }

    if (dados.descricao.length < 10) {
      mostrarMensagem('A descrição precisa ter pelo menos 10 caracteres.', 'error');
      descricao.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando denúncia...';

    try {
      await CloudDB.criarProblema(dados, arquivoFoto);
      mostrarMensagem('Denúncia enviada! Abrindo a página inicial...', 'success');
      setTimeout(() => {
        location.href = '../index.html';
      }, 800);
    } catch (error) {
      submitButton.disabled = false;
      submitButton.innerHTML = '<span>➤</span> Enviar denúncia';
      const mensagem = error.message || '';
      if (mensagem.includes('problemas_descricao_check')) {
        mostrarMensagem('A descrição precisa ter entre 10 e 600 caracteres.', 'error');
      } else if (mensagem.includes('problemas_titulo_check')) {
        mostrarMensagem('O título precisa ter entre 3 e 80 caracteres.', 'error');
      } else {
        mostrarMensagem(mensagem || 'Não foi possível enviar a denúncia.', 'error');
      }
    }
  });
})();
