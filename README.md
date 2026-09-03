# Gante Barbearia

Aplicação de apresentação, cadastro, autenticação e agendamento da Gante Barbearia. O repositório Git fica nesta pasta e a aplicação fica em `web/`.

[![Abrir no GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/christianlemes/Barbearia-Gante?quickstart=1)

No GitHub Codespaces, a instalação e a inicialização são automáticas. Quando o ambiente terminar de preparar, a prévia da Gante abre em uma porta encaminhada e os registros ficam em `/tmp/gante-dev.log`. A landing page funciona imediatamente; para autenticação e agenda, configure as variáveis `NEXT_PUBLIC_FIREBASE_*` como secrets do Codespaces ou use a publicação oficial.

## Rodar e depurar pelo Git Bash — opção recomendada

Pré-requisitos: Node.js 22.13 ou superior, npm e Java 21 para os emuladores do Firebase.

Abra o Git Bash na pasta do repositório, instale as dependências na primeira vez e use um único comando:

```bash
cd /c/Users/lemes/OneDrive/Desktop/Barbearia-Gante/web
npm install
npm run dev:local
```

Esse comando localiza automaticamente o Java portátil em `Barbearia-Gante/work/java` e inicia o site e os emuladores juntos. Durante esse comando, as variáveis do Firebase local são aplicadas apenas aos processos de desenvolvimento: sua configuração do Firebase real em `.env.local` é preservada. Use `Ctrl+C` para encerrar tudo.

Em uma instalação nova, crie `web/.env.local` a partir de `.env.example`. Para desenvolvimento sem usar o banco de produção, use os valores abaixo e troque apenas o e-mail administrativo:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-gante.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-gante
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-gante.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=100000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:100000000000:web:gante
NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL=seu-email-administrativo@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

### Alternativa manual: dois terminais

Use esta forma apenas se quiser observar ou reiniciar o Firebase e o site separadamente.

#### Terminal 1 — Firebase local

Se o Java portátil estiver na pasta `work/java`, configure-o nesta sessão do Git Bash e inicie os emuladores:

```bash
export JAVA_HOME="/c/Users/lemes/OneDrive/Desktop/Barbearia-Gante/work/java/jdk-21.0.12.1+1"
export PATH="$JAVA_HOME/bin:$PATH"
cd /c/Users/lemes/OneDrive/Desktop/Barbearia-Gante/web
npm run firebase:emulators
```

O painel do Firebase local fica em `http://localhost:4000`. Autenticação e Firestore ficam isolados no computador, portanto você pode criar usuários e reservas de teste sem afetar produção.

#### Terminal 2 — site

```bash
cd /c/Users/lemes/OneDrive/Desktop/Barbearia-Gante/web
npm run dev
```

Abra `http://localhost:3000`. As alterações em componentes React e estilos são recarregadas automaticamente.

## Rodar com o Firebase real

O arquivo `web/.env.local` é local e não vai para o GitHub. Preencha-o com a configuração do aplicativo Web fornecida pelo Firebase, mantenha `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false` e execute:

```bash
cd /c/Users/lemes/OneDrive/Desktop/Barbearia-Gante/web
npm run dev
```

Use `npm run dev:local` quando quiser testar contas, reservas, cancelamentos e alterações administrativas sem gravar nada no banco real. Use `npm run dev` somente quando quiser validar a integração do projeto real.

No Firebase Console, o projeto precisa ter:

- Authentication com os provedores E-mail/senha e Google habilitados;
- banco Cloud Firestore criado;
- domínio da publicação incluído em Authentication > Settings > Authorized domains;
- regras e índices deste repositório publicados com `firebase deploy --only firestore`.

### Ver erros e validar antes de publicar

O terminal do site mostra erros de compilação e requisições. O console do navegador mostra erros do cliente. Para executar lint e uma compilação completa:

```bash
npm run check
```

Comandos úteis do Git, executados na pasta principal:

```bash
cd /c/Users/lemes/OneDrive/Desktop/Barbearia-Gante
git status
git diff
git add .
git commit -m "Descreva a alteração"
git push origin main
```

Não execute `git init` dentro de `web/`: isso recriaria um segundo repositório e faria o GitHub mostrar a pasta como um link separado.
