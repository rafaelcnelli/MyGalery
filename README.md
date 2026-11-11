# Sonoma Web OS — App Launcher & Hub de Criações 🚀

Uma aplicação web ultra-moderna estilo **macOS Sonoma**, **iPadOS** e **Raycast** construída em **React 19**, **TypeScript**, **Tailwind CSS** e **Lucide React**, com:

- 🖥️ **Área de Trabalho em Grid Livre:** Posicionamento em 40 slots sem sobreposição (Auto-Swap inteligente ao arrastar ou soltar).
- 🪐 **Visualização em Esfera 3D (WatchOS Honeycomb):** Lente esférica interativa com relógio analógico funcional em tempo real no centro, zoom, pan e rotação.
- 📱 **Página Única Sem Rolagem (Zero-Scroll):** Layout 100% responsivo que cabe em qualquer tela, com opção de comprimir o grid para até **2, 3 ou 4 apps por linha**.
- 🔼 **Menu Minimizado / Dynamic Island:** Possibilidade de recolher o menu superior em uma cápsula compacta para maximizar a área útil da tela.
- 🎨 **Wallpaper Dinâmico:** 4 temas visuais em Dark Mode com luzes difusas (*Aurora Dark*, *Midnight Minimal*, *Cyber Grid*, *Deep Ocean*).
- 🔍 **Busca Rápida Raycast:** Atalho global `⌘K` / `Ctrl+K` para filtrar por nome ou tag em tempo real.
- 🪟 **macOS Sonoma Live Preview Modal:** Teste seus web apps diretamente na tela em viewports Desktop (100%), Tablet (768px) ou Mobile (390×844px).
- ☁️ **Sincronização na Nuvem:**
  - Login com Google e **Firebase Firestore** em tempo real com regras de segurança ativas.
  - Sincronização REST JSON opcional.
  - Backup e restauração local `.json` para funcionamento 100% offline.

---

## 🛠️ Como Executar Localmente

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` no seu navegador.

3. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🚀 Como Subir para o GitHub e Publicar no GitHub Pages

O projeto já está **100% configurado** com `base: './'` no `vite.config.ts`, favicon oficial SVG em `/public/favicon.svg` e automação pronta em `.github/workflows/deploy.yml`.

### Passo 1: Inicializar o repositório Git local e fazer o primeiro commit

No seu terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "feat: initial commit - Sonoma Web OS Launcher"
git branch -M main
```

### Passo 2: Conectar ao seu repositório no GitHub

Crie um novo repositório vazio no GitHub (ex: `sonoma-web-os`) e execute:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

### Passo 3: Ativar o GitHub Pages com 1 clique

1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Na seção **Build and deployment**:
   - Em **Source**, selecione **GitHub Actions**.
4. Pronto! O GitHub executará automaticamente o workflow `.github/workflows/deploy.yml`. Em cerca de 1 a 2 minutos, o seu site estará publicado e acessível no link:
   ```
   https://SEU-USUARIO.github.io/SEU-REPOSITORIO/
   ```

---

## 🔐 Configuração do Firebase Auth no GitHub Pages (Opcional)

Se você utilizar a sincronização com Conta Google e Firestore:
1. Abra o [Console do Firebase](https://console.firebase.google.com/).
2. Selecione seu projeto -> **Authentication** -> aba **Settings** (Configurações) -> **Authorized domains** (Domínios autorizados).
3. Clique em **Add domain** e adicione:
   ```
   SEU-USUARIO.github.io
   ```
*(Nota: mesmo sem o login do Google, o aplicativo funciona de maneira 100% autônoma salvando dados no localStorage do navegador e permitindo exportar/importar arquivos de backup em JSON).*

---

## 📄 Licença

MIT License. Desenvolvido para produtividade e organização pessoal de criações web.
