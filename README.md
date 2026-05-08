# Instalação

## 1. Clonar repositório
``` bash
git clone https://github.com/GuiSmithMhnet/kanban.git
```
---
## 2. Criar rede compartilhada
**OBS:** Ignorar se não for usar `docker`
``` bash
docker network create kanban-shared-services
```
---
## 3. Clonar repositório de arquivos
Segue repositório: https://github.com/GuiSmithMhnet/OperaFR
**Observações:**
 1. Use outra pasta
---
## 4. Criar .env
``` bash
cp .env.example .env
```
**Observações:**
 1. Preencha a chave `OPERA_API_KEY` de acordo com a chave `USER_API_KEY` do repositório de arquivos.
 2. Caso não vá usar docker no repositório de arquivos, altere a chave `OPERA_LINK` no .env
---
## 5. Suba o projeto:
No docker:
``` bash
docker compose up kanban-app -d --build
```
Sem docker:
```
npm install
npm run build
npm start
```
---
## 6. Fim
Acesse pela porta definida no docker-compose.yml do projeto (3001)