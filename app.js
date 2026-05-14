/**
 * Salon No-Code Builder - Lógica do Painel
 * Este arquivo gerencia a interação do painel de edição com o site
 * e persiste as configurações no localStorage do navegador.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. ELEMENTOS DO DOM
    // ==========================================
    
    // Controles do Painel
    const toggleEditorBtn = document.getElementById('toggle-editor');
    const closeEditorBtn = document.getElementById('close-editor');
    const editorPanel = document.getElementById('editor-panel');
    const saveChangesBtn = document.getElementById('save-changes');
    const resetChangesBtn = document.getElementById('reset-changes');

    // Inputs de Cores
    const colorPrimaryInput = document.getElementById('color-primary');
    const colorTextInput = document.getElementById('color-text');
    const colorBgInput = document.getElementById('color-bg');
    
    // Displays Hex
    const hexPrimaryDisplay = document.getElementById('hex-primary');
    const hexTextDisplay = document.getElementById('hex-text');
    const hexBgDisplay = document.getElementById('hex-bg');

    // Tipografia e Textos
    const fontTitleSelect = document.getElementById('font-title-select');
    const salonNameInput = document.getElementById('edit-salon-name');
    const salonSloganInput = document.getElementById('edit-salon-slogan');
    const whatsappInput = document.getElementById('edit-whatsapp');
    const addressInput = document.getElementById('edit-address');

    // Elementos Dinâmicos na Tela
    const rootStyle = document.documentElement.style;
    const dynamicTexts = document.querySelectorAll('.dynamic-text');
    const whatsappLinks = document.querySelectorAll('.whatsapp-link');
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
        whatsapp: '5541999999999',
        address: 'Rua XV de Novembro, 1000 - Centro, Curitiba - PR'
    };

    // Obter configuração salva ou usar padrão
    let currentConfig = JSON.parse(localStorage.getItem('salonConfig')) || { ...defaultConfig };

    // ==========================================
    // 3. FUNÇÕES NÚCLEO (CORE)
    // ==========================================

    // Atualiza todo o site com base na configuração atual
    function applyConfiguration(config) {
        // 1. Aplicar Cores (CSS Variables)
        rootStyle.setProperty('--primary-color', config.colorPrimary);
        rootStyle.setProperty('--text-color', config.colorText);
        rootStyle.setProperty('--bg-color', config.colorBg);
        
        // Calcular cor primária mais clara (usada em badges de preço)
        rootStyle.setProperty('--primary-light', config.colorPrimary + '20'); // 20% de opacidade

        // 2. Aplicar Tipografia
        rootStyle.setProperty('--font-heading', `"${config.fontTitle}", serif`);

        // 3. Aplicar Textos
        dynamicTexts.forEach(element => {
            const key = element.getAttribute('data-key');
            if (config[key]) {
                element.textContent = config[key];
            }
        });

        // 4. Atualizar Links do WhatsApp
        const whatsappUrl = `https://wa.me/${config.whatsapp}?text=Olá! Gostaria de agendar um horário.`;
        whatsappLinks.forEach(link => {
            link.setAttribute('href', whatsappUrl);
        });

        // 5. Atualizar Google Maps (Apenas se houver chave real da API no futuro, mas o embed iframe usa 'q=')
        const encodedAddress = encodeURIComponent(config.address);
        // Utilizando o formato embed sem API key
        googleMapIframe.src = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

        // 6. Atualizar valores nos inputs do painel
        syncInputsWithConfig(config);
    }

    // Sincroniza os valores dos inputs do painel com a configuração
    function syncInputsWithConfig(config) {
        colorPrimaryInput.value = config.colorPrimary;
        colorTextInput.value = config.colorText;
        colorBgInput.value = config.colorBg;
        
        hexPrimaryDisplay.textContent = config.colorPrimary;
        hexTextDisplay.textContent = config.colorText;
        hexBgDisplay.textContent = config.colorBg;

        fontTitleSelect.value = config.fontTitle;
        salonNameInput.value = config.salonName;
        salonSloganInput.value = config.salonSlogan;
        whatsappInput.value = config.whatsapp;
        addressInput.value = config.address;
    }

    // ==========================================
    // 4. EVENT LISTENERS
    // ==========================================

    // Abrir/Fechar Painel
    toggleEditorBtn.addEventListener('click', () => editorPanel.classList.add('active'));
    closeEditorBtn.addEventListener('click', () => editorPanel.classList.remove('active'));

    // Fechar painel clicando fora
    document.addEventListener('click', (e) => {
        if (!editorPanel.contains(e.target) && !toggleEditorBtn.contains(e.target) && editorPanel.classList.contains('active')) {
            editorPanel.classList.remove('active');
        }
    });

    // Inputs de Cor (Preview em Tempo Real)
    colorPrimaryInput.addEventListener('input', (e) => {
        const val = e.target.value;
        hexPrimaryDisplay.textContent = val;
        rootStyle.setProperty('--primary-color', val);
        rootStyle.setProperty('--primary-light', val + '20');
        currentConfig.colorPrimary = val;
    });

    colorTextInput.addEventListener('input', (e) => {
        const val = e.target.value;
        hexTextDisplay.textContent = val;
        rootStyle.setProperty('--text-color', val);
        currentConfig.colorText = val;
    });

    colorBgInput.addEventListener('input', (e) => {
        const val = e.target.value;
        hexBgDisplay.textContent = val;
        rootStyle.setProperty('--bg-color', val);
        currentConfig.colorBg = val;
    });

    // Inputs de Texto (Preview em Tempo Real)
    salonNameInput.addEventListener('input', (e) => {
        const val = e.target.value;
        document.querySelectorAll('[data-key="salonName"]').forEach(el => el.textContent = val);
        currentConfig.salonName = val;
    });

    salonSloganInput.addEventListener('input', (e) => {
        const val = e.target.value;
        document.querySelectorAll('[data-key="salonSlogan"]').forEach(el => el.textContent = val);
        currentConfig.salonSlogan = val;
    });

    addressInput.addEventListener('input', (e) => {
        const val = e.target.value;
        document.querySelectorAll('[data-key="address"]').forEach(el => el.textContent = val);
        currentConfig.address = val;
        
        // Debounce para não carregar o mapa a cada letra digitada
        clearTimeout(window.mapTimeout);
        window.mapTimeout = setTimeout(() => {
            const encodedAddress = encodeURIComponent(val);
            googleMapIframe.src = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }, 1000);
    });

    fontTitleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        rootStyle.setProperty('--font-heading', `"${val}", serif`);
        currentConfig.fontTitle = val;
    });

    whatsappInput.addEventListener('input', (e) => {
        currentConfig.whatsapp = e.target.value;
        const whatsappUrl = `https://wa.me/${currentConfig.whatsapp}?text=Olá! Gostaria de agendar um horário.`;
        whatsappLinks.forEach(link => link.setAttribute('href', whatsappUrl));
    });

    // Salvar e Restaurar (Botões Principais)
    saveChangesBtn.addEventListener('click', () => {
        localStorage.setItem('salonConfig', JSON.stringify(currentConfig));
        
        // Feedback visual no botão
        const originalText = saveChangesBtn.innerHTML;
        saveChangesBtn.innerHTML = '<i data-lucide="check"></i> Salvo com Sucesso!';
        lucide.createIcons();
        saveChangesBtn.style.backgroundColor = '#059669';
        
        setTimeout(() => {
            saveChangesBtn.innerHTML = originalText;
            saveChangesBtn.style.backgroundColor = '';
            lucide.createIcons();
        }, 2000);
    });

    resetChangesBtn.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja restaurar as configurações originais? Tudo que você alterou será perdido.')) {
            currentConfig = { ...defaultConfig };
            applyConfiguration(currentConfig);
            localStorage.removeItem('salonConfig');
            
            // Feedback visual no botão
            const originalText = resetChangesBtn.innerHTML;
            resetChangesBtn.innerHTML = '<i data-lucide="check"></i> Restaurado!';
            lucide.createIcons();
            
            setTimeout(() => {
                resetChangesBtn.innerHTML = originalText;
                lucide.createIcons();
            }, 2000);
        }
    });

    // ==========================================
    // 5. INICIALIZAÇÃO
    // ==========================================
    applyConfiguration(currentConfig);
});
