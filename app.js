/**
 * Salon No-Code Builder - Lógica Avançada (Fase 2)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 0. VERIFICAÇÃO DE ADMIN (URL)
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';
    const toggleEditorBtn = document.getElementById('toggle-editor');
    
    // Se for admin, mostra o botão do construtor
    if (isAdmin) {
        toggleEditorBtn.style.display = 'flex';
    }

    // ==========================================
    // 1. ELEMENTOS DO DOM
    // ==========================================
    const closeEditorBtn = document.getElementById('close-editor');
    const editorPanel = document.getElementById('editor-panel');
    const saveChangesBtn = document.getElementById('save-changes');
    const resetChangesBtn = document.getElementById('reset-changes');

    // Inputs Gerais
    const colorPrimaryInput = document.getElementById('color-primary');
    const colorTextInput = document.getElementById('color-text');
    const colorBgInput = document.getElementById('color-bg');
    const fontTitleSelect = document.getElementById('font-title-select');
    
    const salonNameInput = document.getElementById('edit-salon-name');
    const salonSloganInput = document.getElementById('edit-salon-slogan');
    const addressInput = document.getElementById('edit-address');
    
    // Novos Inputs (Sobre, Whats, Insta)
    const aboutTitleInput = document.getElementById('edit-about-title');
    const aboutTextInput = document.getElementById('edit-about-text');
    const uploadAboutImg = document.getElementById('upload-about-img');
    const aboutImgPreview = document.getElementById('about-img-preview');
    
    const whatsappInput = document.getElementById('edit-whatsapp');
    const whatsappMsgInput = document.getElementById('edit-whatsapp-msg');
    const instagramInput = document.getElementById('edit-instagram');
    
    // Galeria
    const uploadGalleryImg = document.getElementById('upload-gallery-img');
    const clearGalleryBtn = document.getElementById('clear-gallery');
    const galleryGrid = document.getElementById('gallery-grid');

    // Elementos Dinâmicos Visuais
    const rootStyle = document.documentElement.style;
    const dynamicTexts = document.querySelectorAll('.dynamic-text');
    const whatsappLinks = document.querySelectorAll('.whatsapp-link');
    const igLinks = document.querySelectorAll('.dynamic-ig-link');
    const googleMapIframe = document.getElementById('google-map');

    // ==========================================
    // 2. CONFIGURAÇÕES PADRÃO (DEFAULT)
    // ==========================================
    const defaultConfig = {
        colorPrimary: '#d4af37',
        colorText: '#333333',
        colorBg: '#ffffff',
        fontTitle: 'Playfair Display',
        salonName: 'Salão Elegance',
        salonSlogan: 'Realçando a sua beleza natural no coração de Curitiba.',
        aboutTitle: 'Sobre a Nossa História',
        aboutText: 'Desde 2015, o Salão Elegance tem sido referência em Curitiba, trazendo as últimas tendências mundiais de beleza. Nossa equipe é formada por profissionais apaixonados por elevar a autoestima de cada cliente.',
        aboutImageBase64: '', // Vazio usa a imagem padrão
        whatsapp: '5541999999999',
        whatsappMsg: 'Olá! Vi o site e gostaria de agendar um horário.',
        instagram: 'salaoelegance',
        address: 'Rua XV de Novembro, 1000 - Centro, Curitiba - PR',
        galleryImages: [] // Array de Base64
    };

    let currentConfig = JSON.parse(localStorage.getItem('salonConfig')) || { ...defaultConfig };

    // ==========================================
    // 3. FUNÇÕES NÚCLEO (CORE)
    // ==========================================

    function applyConfiguration(config) {
        // Cores
        rootStyle.setProperty('--primary-color', config.colorPrimary);
        rootStyle.setProperty('--text-color', config.colorText);
        rootStyle.setProperty('--bg-color', config.colorBg);
        rootStyle.setProperty('--primary-light', config.colorPrimary + '20');
        
        // Fontes (Se for uma fonte com espaço, precisa de aspas)
        rootStyle.setProperty('--font-heading', `"${config.fontTitle}", serif`);

        // Textos Dinâmicos (Nome, Slogan, Sobre, Endereço, IG)
        dynamicTexts.forEach(el => {
            const key = el.getAttribute('data-key');
            if (config[key] !== undefined) el.textContent = config[key];
        });

        // WhatsApp Dinâmico
        const encodedMsg = encodeURIComponent(config.whatsappMsg);
        const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${encodedMsg}`;
        whatsappLinks.forEach(link => link.setAttribute('href', whatsappUrl));

        // Instagram Dinâmico
        const igUrl = `https://instagram.com/${config.instagram.replace('@', '')}`;
        igLinks.forEach(link => link.setAttribute('href', igUrl));

        // Google Maps
        const encodedAddress = encodeURIComponent(config.address);
        googleMapIframe.src = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

        // Imagem Sobre Nós
        if (config.aboutImageBase64) {
            aboutImgPreview.src = config.aboutImageBase64;
        } else {
            aboutImgPreview.src = 'assets/equipe.png'; // Fallback default
        }

        // Renderizar Galeria
        renderGallery(config.galleryImages);

        // Atualizar inputs
        syncInputsWithConfig(config);
    }

    function syncInputsWithConfig(config) {
        colorPrimaryInput.value = config.colorPrimary;
        colorTextInput.value = config.colorText;
        colorBgInput.value = config.colorBg;
        
        document.getElementById('hex-primary').textContent = config.colorPrimary;
        document.getElementById('hex-text').textContent = config.colorText;
        document.getElementById('hex-bg').textContent = config.colorBg;

        fontTitleSelect.value = config.fontTitle;
        salonNameInput.value = config.salonName;
        salonSloganInput.value = config.salonSlogan;
        
        aboutTitleInput.value = config.aboutTitle;
        aboutTextInput.value = config.aboutText;
        
        whatsappInput.value = config.whatsapp;
        whatsappMsgInput.value = config.whatsappMsg;
        instagramInput.value = config.instagram;
        addressInput.value = config.address;
    }

    function renderGallery(imagesArray) {
        galleryGrid.innerHTML = ''; // Limpa
        if (!imagesArray || imagesArray.length === 0) {
            // Se vazio, coloca fotos padrão de demonstração
            const defaultImages = ['assets/corte.png', 'assets/unhas.png', 'assets/maquiagem.png'];
            defaultImages.forEach(src => {
                galleryGrid.innerHTML += `
                    <div class="gallery-item">
                        <img src="${src}" alt="Trabalho">
                    </div>`;
            });
            return;
        }

        // Se tem fotos customizadas
        imagesArray.forEach(base64Str => {
            galleryGrid.innerHTML += `
                <div class="gallery-item">
                    <img src="${base64Str}" alt="Nosso Trabalho">
                </div>`;
        });
    }

    // ==========================================
    // 4. EVENT LISTENERS
    // ==========================================

    // Painel e Cores
    toggleEditorBtn.addEventListener('click', () => editorPanel.classList.add('active'));
    closeEditorBtn.addEventListener('click', () => editorPanel.classList.remove('active'));

    ['primary', 'text', 'bg'].forEach(type => {
        document.getElementById(`color-${type}`).addEventListener('input', (e) => {
            const val = e.target.value;
            document.getElementById(`hex-${type}`).textContent = val;
            rootStyle.setProperty(`--${type === 'text' ? 'text-color' : type === 'bg' ? 'bg-color' : 'primary-color'}`, val);
            if(type==='primary') rootStyle.setProperty('--primary-light', val + '20');
            
            const key = type === 'primary' ? 'colorPrimary' : type === 'text' ? 'colorText' : 'colorBg';
            currentConfig[key] = val;
        });
    });

    fontTitleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        rootStyle.setProperty('--font-heading', `"${val}", serif`);
        currentConfig.fontTitle = val;
    });

    // Inputs de Texto Simples
    const textBindings = [
        { id: 'edit-salon-name', key: 'salonName' },
        { id: 'edit-salon-slogan', key: 'salonSlogan' },
        { id: 'edit-about-title', key: 'aboutTitle' },
        { id: 'edit-about-text', key: 'aboutText' },
        { id: 'edit-instagram', key: 'instagram' }
    ];

    textBindings.forEach(binding => {
        document.getElementById(binding.id).addEventListener('input', (e) => {
            const val = e.target.value;
            document.querySelectorAll(`[data-key="${binding.key}"]`).forEach(el => el.textContent = val);
            currentConfig[binding.key] = val;
            
            // Especial para Instagram (atualiza links)
            if(binding.key === 'instagram') {
                const igUrl = `https://instagram.com/${val.replace('@', '')}`;
                igLinks.forEach(link => link.setAttribute('href', igUrl));
            }
        });
    });

    // Inputs Especiais (Maps e Whats)
    addressInput.addEventListener('input', (e) => {
        const val = e.target.value;
        document.querySelectorAll('[data-key="address"]').forEach(el => el.textContent = val);
        currentConfig.address = val;
        
        clearTimeout(window.mapTimeout);
        window.mapTimeout = setTimeout(() => {
            googleMapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(val)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }, 1000);
    });

    function updateWhatsapp() {
        const msg = encodeURIComponent(currentConfig.whatsappMsg);
        const num = currentConfig.whatsapp.replace(/\D/g, ''); // Apenas números
        const url = `https://wa.me/${num}?text=${msg}`;
        whatsappLinks.forEach(link => link.setAttribute('href', url));
    }

    whatsappInput.addEventListener('input', (e) => {
        currentConfig.whatsapp = e.target.value;
        updateWhatsapp();
    });

    whatsappMsgInput.addEventListener('input', (e) => {
        currentConfig.whatsappMsg = e.target.value;
        updateWhatsapp();
    });

    // ==========================================
    // 5. UPLOAD DE IMAGENS (FILEREADER)
    // ==========================================
    
    // Função utilitária para converter imagem local em Base64
    function handleImageUpload(file, callback) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
    }

    // Upload: Sobre Nós
    uploadAboutImg.addEventListener('change', (e) => {
        handleImageUpload(e.target.files[0], (base64) => {
            aboutImgPreview.src = base64;
            currentConfig.aboutImageBase64 = base64;
        });
    });

    // Upload: Galeria
    uploadGalleryImg.addEventListener('change', (e) => {
        handleImageUpload(e.target.files[0], (base64) => {
            if (!currentConfig.galleryImages) currentConfig.galleryImages = [];
            currentConfig.galleryImages.unshift(base64); // Adiciona no início (mais recente)
            
            // Limitar a 6 fotos para não estourar muito o LocalStorage
            if (currentConfig.galleryImages.length > 6) {
                currentConfig.galleryImages.pop();
            }
            
            renderGallery(currentConfig.galleryImages);
        });
    });

    clearGalleryBtn.addEventListener('click', () => {
        if(confirm('Limpar todas as fotos customizadas da galeria?')) {
            currentConfig.galleryImages = [];
            renderGallery([]); // Volta pros defaults
        }
    });

    // ==========================================
    // 6. SALVAR E RESTAURAR
    // ==========================================
    saveChangesBtn.addEventListener('click', () => {
        try {
            localStorage.setItem('salonConfig', JSON.stringify(currentConfig));
            const originalText = saveChangesBtn.innerHTML;
            saveChangesBtn.innerHTML = '<i data-lucide="check"></i> Salvo com Sucesso!';
            lucide.createIcons();
            saveChangesBtn.style.backgroundColor = '#059669';
            
            setTimeout(() => {
                saveChangesBtn.innerHTML = originalText;
                saveChangesBtn.style.backgroundColor = '';
                lucide.createIcons();
            }, 2000);
        } catch (e) {
            // LocalStorage tem limite de ~5MB. Se upar muitas fotos HD, pode dar erro.
            alert('Erro ao salvar. Tente imagens com tamanho menor (limite de armazenamento local atingido).');
        }
    });

    resetChangesBtn.addEventListener('click', () => {
        if(confirm('Restaurar tudo? Suas fotos e textos serão apagados.')) {
            currentConfig = { ...defaultConfig };
            applyConfiguration(currentConfig);
            localStorage.removeItem('salonConfig');
        }
    });

    // Inicializa site na primeira carga
    applyConfiguration(currentConfig);
});
