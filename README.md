# Matheus Andrade — o livro

**🇧🇷 Português** · [🇺🇸 English](README.en.md)

Portfólio de **Matheus da Silva Andrade**, desenvolvedor full stack, professor e pesquisador, em forma de **livro de edição de luxo**, em português e inglês.

**Versão 4.3.0** · histórico completo no [CHANGELOG](CHANGELOG.md).

🔗 **No ar:** [matityahu.alwaysdata.net/dev-matheus-andrade](https://matityahu.alwaysdata.net/dev-matheus-andrade/) · [GitHub Pages](https://anddrad3.github.io/matheus-andrade-livro/)

Ao entrar, uma **cutscene** desce a câmera até o livro sobre a mesa — óculos, caneta-tinteiro, bilhete, bloco de notas, café (ou vela), copo de whisky, isqueiro, celular e um cigarro no cinzeiro (apagado na edição clássica, fumegando na Sombria) — enquanto a trilha ao piano começa. Ao toque, o livro levita, dá uma volta completa no ar, a capa se abre e a câmera mergulha nas páginas até uma estrela de luz revelar o **sumário**.

O site segue o **aparelho de quem visita**: tema claro → edição clássica, tema escuro → Edição Sombria; idioma português → livro em português, qualquer outro → inglês. Dá para trocar a qualquer momento (botão do tema e o interruptor **PT ⇄ EN** no topo).

## Duas edições

| | Clássica (tema claro) | Sombria (tema escuro) |
|---|---|---|
| Capa | Couro castanho, ouro em folha, medalhão guilloché | Couro negro, prata, caveira gravada de Dürer, *Nevermore* |
| Miolo | Papel creme envelhecido, corte dourado | Papel osso, páginas negras de abertura, corte preto |
| Mesa | Madeira quente, marca de café, cigarro apagado | Ébano, vela com cera vermelha, cigarro aceso |
| Trilha | *Ária* de Bach ao piano | *Lacrimosa* de Mozart ao piano |
| Celular da mesa | App claro, capa com o **Paraíso** de Doré | App escuro, capa com o **Inferno** de Doré |
| Objetos | Falas alegres, chamam o dono de **Matheus** | Falas macabras com humor, chamam o dono de **Andrade** |

## Capítulos

| | Capítulo | Conteúdo |
|---|---|---|
| § | Prólogo | Quem escreve: bio, formação e ficha catalográfica |
| I | Arsenal | Linguagens, interfaces, back-end, mapas & IA, ofício |
| II | Obras | Ameríndia, Voz do Professor, MLG, BloqueiaShorts e CNPJ Escolas |
| III | Formação | Da ETEC à UNESP, PIBIC e o próximo capítulo: o mestrado |
| § | Epílogo | Carta de contato, assinatura a pena e o **diário de bordo** com commits ao vivo do GitHub |
| — | Colofão · Índice remissivo | Créditos tipográficos e um índice clicável |

## Interações

- **Folhear**: **clique na página** (direita avança, esquerda volta; no celular, toque — o terço esquerdo volta) ou arraste de qualquer ponto: a folha é **maleável**, levantada por baixo ou por cima, e curva como papel. Também: setas do teclado, abas ou o sumário.
- **Páginas escritas diante do leitor**: o texto surge palavra a palavra e as imagens são desenhadas a cada página aberta.
- **Visitar a obra** (ou clicar na foto): a câmera mergulha na prancha do site e o site abre em nova aba.
- **Modo 360°**: no computador, arraste fora do livro para girá-lo e, de frente, arraste a página para folhear; no celular, arraste em qualquer lugar (inclusive sobre o livro). "Voltar ao livro", Esc ou duplo clique para sair.
- **Objetos da mesa**: clique e o objeto abre num card, girável em 360° (com inércia suave), com 3 falas por objeto e por tema.
- **Celular da mesa**: abre num app de música com a faixa da edição, um texto sobre ela e a gravura de Doré da *Divina Comédia* como capa; pausar, voltar ao começo, arrastar a faixa, volume, som das páginas e trocar de edição.
- **Zoom**: no computador, a **roda do mouse** aproxima e afasta em torno do cursor (também pinça do trackpad e teclas `+` `−` `0`); no celular, pinça. Aproximado, arraste para passear pela página.
- **Idioma**: interruptor **PT ⇄ EN** no topo — o livro inteiro (páginas, objetos, celular, botões) muda de idioma.
- **Trilha desde o primeiro instante**: se o navegador já libera o som, a abertura começa tocando; se não (regra dos navegadores: som só depois de um toque), o monograma pede “toque para abrir o livro ♪” e esse toque liga a música e a cena juntas.
- **Reiniciar a abertura** (a música recomeça junto) a qualquer momento; **M·A** fecha o livro na capa.
- **Celular**: uma página por vez com os objetos na mesa em volta; deslize para virar; o botão **“2 páginas”** mostra as duas (com o celular em pé, o livro deita na tela — é só virar o aparelho); abas do livro para os capítulos; **barra no rodapé** com tema, música, som das páginas, 360° e abertura.

## Desempenho

- Sem salto de layout ao carregar (CLS 0): o palco só aparece depois de medido; imagens com `width`/`height`.
- Primeira pintura sem depender de JavaScript nem de fontes externas (monograma em fonte do sistema); fontes do Google carregadas sem bloquear.
- Virar páginas sem recalcular o estilo de centenas de palavras a cada quadro; a página que chega é escrita só depois que a folha assenta (nada é pintado no meio da virada); sombra projetada e curva da folha só movem camadas na GPU.
- Nenhum filtro refeito pela GPU a cada quadro: sem desfoque no clarão da troca de cena nem no feixe de luz do fundo; sombras dos objetos fora das camadas animadas.
- Imagens e trilha com cache de um ano (`public/.htaccess`); trilhas em MP3 mono de 80 kbps; gravuras do outro tema e o diário do GitHub só carregam quando necessários.

## Detalhes

- **Abas de dicionário** na lateral do miolo, que acompanham as folhas ao virar.
- **Pranchas fotográficas** dos projetos (com cantoneiras e fita), desenho em traço e prancha de dados.
- **Marginália**: anotações à mão em tinta azul que se escrevem quando a página abre.
- **Som de papel** sintetizado com Web Audio (com botão para desligar) e **sombra projetada** pela folha que vira.
- **Diário de bordo** que busca os commits mais recentes na API pública do GitHub.
- **Livro 3D de verdade**: 12 folhas com frente e verso, profundidade em Z, sombras dinâmicas enquanto a folha vira, bordas do bloco de páginas, pastas maiores que o miolo e marcador de fita.
- **Texturas procedurais**: couro, papel, madeira, guardas marmorizadas e grão de filme nascem de filtros SVG (`src/textures.js`) e são pré-renderizados em WebP com `npm run textures`.
- **Acessível**: páginas fora de vista ficam `inert`, anúncio de página via `aria-live`, respeita `prefers-reduced-motion` e permite o zoom do navegador.

## Editar o conteúdo

O texto está em [`src/content.pt.js`](src/content.pt.js) (português) e [`src/content.en.js`](src/content.en.js) (inglês) — mesma estrutura nos dois. Os textos fixos das páginas e da interface usam `t('português', 'English')` (`src/lang.js`).

## Rodar localmente

```bash
npm install
npm run dev
```

Mudou as cores de alguma textura em `src/textures.js`? Gere os WebP de novo (precisa do Edge ou Chrome instalado):

```bash
npm run textures
```

## Publicação

- **GitHub Pages:** cada push na `main` publica via GitHub Actions (`.github/workflows/deploy.yml`).
- **alwaysdata:** `npm run deploy` faz o build e envia por SSH (`scripts/deploy-alwaysdata.mjs`).

## Stack

Vite · JavaScript puro · GSAP · CSS 3D transforms · SVG procedural · Canvas 2D · Web Audio
Tipografia: Cormorant Garamond, EB Garamond, Pinyon Script, Caveat, Pirata One e Cinzel.

## Créditos de mídia

- **Gravuras (tema claro)** — Albrecht Dürer, *São Jerônimo no estudo* e *Melencolia I* (1514, CC0, Metropolitan Museum of Art); gravura de Flammarion, *L’atmosphère* (1888); Jost Amman, a oficina do impressor (1568). Domínio público.
- **Gravuras (tema escuro)** — Gustave Doré, ilustrações para *The Raven* de E. A. Poe (1884). Domínio público, via Wikimedia Commons.
- **Capas do app de música** — Gustave Doré, ilustrações para a *Divina Comédia* de Dante: *Paraíso*, Canto XXXI, a Rosa Celeste (1868), e *Inferno*, Canto XXXIV, Lúcifer (1861). Domínio público, via Wikimedia Commons.
- **Caveira da Edição Sombria** — *Brasão com Caveira*, Albrecht Dürer (1503). Domínio público (CC0), Metropolitan Museum of Art.
- **Trilha do tema claro** (`public/music/aria-bach-piano.mp3`) — *Ária* da Suíte Orquestral nº 3, BWV 1068, J. S. Bach. Partitura Bach-Gesellschaft do [Mutopia Project](https://www.mutopiaproject.org/) (CC BY-SA 3.0), renderizada num piano amostrado [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3) de Alexander Holm (CC BY 3.0). O áudio resultante é distribuído sob CC BY-SA 3.0.
- **Trilha do tema escuro** (`public/music/lacrimosa-piano.mp3`) — *Lacrimosa* do Réquiem K. 626, W. A. Mozart, na transcrição de S. Thalberg (Op. 70, nº 5A), interpretada por Lệ Xuân — [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Mozart,_Requiem_in_D_minor,_%27Lacrimosa%27_%E2%80%93_piano_arrangement.ogg), CC BY-SA 4.0. Convertida para MP3.
