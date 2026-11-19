# Analisador de Pacientes

Aplicativo mobile que lê uma planilha de pacientes e mostra a quantidade de pessoas por **faixa etária** e **sexo**, com opção de exportar o resultado.

Este projeto é a versão em React Native de um programa desktop originalmente feito em Python (tkinter + pandas).

## Funcionalidades

- Importa planilhas nos formatos `.xlsx`, `.xls` e `.csv`
- Conta pacientes por faixa etária e sexo (Masculino/Feminino)
- Exibe uma tabela com os totais por faixa e o total geral
- Exporta o resultado em `.xlsx` pelo menu de compartilhamento do aparelho

## Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| [React Native](https://reactnative.dev/) | Interface mobile |
| [Expo](https://expo.dev/) (SDK 58) | Ambiente de desenvolvimento, build e execução via Expo Go |
| [expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker/) | Seleção da planilha no aparelho |
| [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) | Gravação do arquivo de resultado (API `File` e `Paths`) |
| [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) | Compartilhar/salvar o arquivo exportado |
| [SheetJS (`xlsx`)](https://sheetjs.com/) | Leitura e criação de planilhas Excel e CSV |
| JavaScript (ES6+) | Linguagem do projeto |

## Estrutura do projeto

```
analisador-mobile/
├── App.js         # Interface e fluxo (importar, exibir, exportar)
├── analisar.js    # Lógica de análise: faixas etárias, normalização, contagem
└── package.json   # Dependências e scripts
```

## Como a planilha deve ser

O app procura as colunas pelo nome do cabeçalho (sem diferenciar maiúsculas de minúsculas):

| Coluna | Conteúdo aceito |
|---|---|
| `IDADE` | Número (aceita vírgula como separador decimal) |
| `SEXO` | `Masculino`, `M`, `Masc` ou `Feminino`, `F`, `Fem` |

Se as colunas `IDADE` e `SEXO` não forem encontradas, o app usa a **segunda coluna (B) como idade** e a **terceira (C) como sexo**.

Linhas com idade inválida/vazia ou sexo não reconhecido são ignoradas.

## Faixas etárias

`0 a 1`, `2 a 4`, `5 a 9`, `10 a 19`, `20 a 29`, `30 a 39`, `40 a 49`, `50 a 59`, `60+`

Para alterar as faixas, edite a lista `FAIXAS` em `analisar.js`.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS) com npm
- App **Expo Go** instalado no celular (Android ou iOS), em versão compatível com o SDK do projeto
- Celular e computador na mesma rede Wi-Fi

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start
   ```
3. Escaneie o QR code exibido no terminal com o Expo Go.

Se a rede bloquear a conexão, use:
```bash
npx expo start --tunnel
```

Se o app mostrar versão antiga após editar os arquivos, limpe o cache:
```bash
npx expo start -c
```

## Como usar

1. Toque em **Importar** e escolha a planilha.
2. Veja a tabela com a contagem por faixa etária e sexo e os totais acima dela.
3. Toque em **Exportar** para gerar o arquivo `resultado_pacientes.xlsx` e salvá-lo ou compartilhá-lo.

## Observações técnicas

- A planilha escolhida é lida com `fetch` + `FileReader` (convertida para base64) e interpretada pelo `xlsx`. Isso evita restrições de permissão da API de arquivos do Expo Go ao acessar o arquivo copiado pelo seletor.
- O arquivo exportado é gravado no diretório de cache do app e entregue ao menu de compartilhamento.
- Todo o processamento é feito localmente no aparelho; nenhum dado de pacientes é enviado para a internet.

## Gerar um app instalável (opcional)

Para criar um `.apk` (Android) e instalar sem o Expo Go, use o [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## Origem do projeto

Port do script Python original (`tkinter` + `pandas`) que fazia a mesma análise no computador. A lógica de faixas etárias, normalização de sexo e busca das colunas foi mantida.
