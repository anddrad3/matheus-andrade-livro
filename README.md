# Matheus Andrade — o livro

Portfólio de **Matheus da Silva Andrade**, desenvolvedor full stack, professor e pesquisador, em forma de **livro de edição de luxo**.

🔗 **No ar:** [matityahu.alwaysdata.net/dev-matheus-andrade](https://matityahu.alwaysdata.net/dev-matheus-andrade/) · [GitHub Pages](https://anddrad3.github.io/matheus-andrade-livro/)

Ao entrar, um volume encadernado em couro repousa sobre uma mesa de madeira sob a luz da luminária; ao toque, a capa se abre em 3D, a folha de rosto aparece e a página vira para o **sumário**.

## Capítulos

| | Capítulo | Conteúdo |
|---|---|---|
| § | Prólogo | Quem escreve: bio, formação e ficha catalográfica |
| I | Arsenal | Linguagens, interfaces, back-end, mapas & IA, ofício |
| II | Obras | Ameríndia, Voz do Professor, MLG, BloqueiaShorts e CNPJ Escolas |
| III | Formação | Da ETEC à UNESP, PIBIC e o próximo capítulo: o mestrado |
| § | Epílogo | Carta de contato, assinatura a pena e o **diário de bordo** com commits ao vivo do GitHub |
| — | Colofão · Índice remissivo | Créditos tipográficos e um índice clicável |

## Detalhes

- **Abas de dicionário** na lateral do miolo, que acompanham as folhas ao virar.
- **Pranchas fotográficas** dos projetos (com cantoneiras e fita), desenho em traço e prancha de dados.
- **Marginália**: anotações à mão em tinta azul que se escrevem quando a página abre.
- **Som de papel** sintetizado com Web Audio (com botão para desligar) e **sombra projetada** pela folha que vira.
- **Diário de bordo** que busca os commits mais recentes na API pública do GitHub.
- **Livro 3D de verdade**: 10 folhas com frente e verso, profundidade em Z, sombras dinâmicas enquanto a folha vira, bordas do bloco de páginas, pastas maiores que o miolo e marcador de fita.
- **Folhear rápido**: clicar num capítulo do sumário folheia as páginas intermediárias em sequência.
- **Texturas procedurais**: couro, papel, madeira, guardas marmorizadas e grão de filme são filtros SVG procedurais; rosetas, cantoneiras, florões, selo e código de barras são vetores gerados em JS.
- **Ouro em folha** com brilho que acompanha o cursor; poeira dançando na luz em canvas.
- **Navegação**: setas do teclado, roda do mouse, arrastar no toque, cantos da página, botões, links diretos por hash (`#obras`, `#epilogo`…).
- **Responsivo**: no celular o livro mostra uma página por vez e desliza entre elas.
- **Acessível**: páginas fora de vista ficam `inert`, anúncio de página via `aria-live`, respeita `prefers-reduced-motion` (pula a abertura e as animações).

## Editar o conteúdo

Todo o texto está em [`src/content.js`](src/content.js): nome, cargo, bio, stack, projetos, experiência, links e e-mail.

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicação

- **GitHub Pages:** cada push na `main` publica via GitHub Actions (`.github/workflows/deploy.yml`).
- **alwaysdata:** `npm run deploy` faz o build e envia por SSH (`scripts/deploy-alwaysdata.mjs`).

## Stack

Vite · JavaScript puro · GSAP · CSS 3D transforms · SVG procedural · Canvas 2D
Tipografia: Cormorant Garamond, EB Garamond, Pinyon Script e Caveat.

## Créditos de mídia

- **Caveira da Edição Sombria** — *Brasão com Caveira*, Albrecht Dürer (1503). Domínio público (CC0), Metropolitan Museum of Art.
- **Trilha do tema claro** (`public/music/aria-bach-piano.mp3`) — *Ária* da Suíte Orquestral nº 3, BWV 1068, J. S. Bach. Partitura Bach-Gesellschaft do [Mutopia Project](https://www.mutopiaproject.org/) (CC BY-SA 3.0), renderizada num piano amostrado [Salamander Grand Piano](https://archive.org/details/SalamanderGrandPianoV3) de Alexander Holm (CC BY 3.0). O áudio resultante é distribuído sob CC BY-SA 3.0.
- **Trilha do tema escuro** (`public/music/lacrimosa-piano.mp3`) — *Lacrimosa* do Réquiem K. 626, W. A. Mozart, na transcrição de S. Thalberg (Op. 70, nº 5A), interpretada por Lệ Xuân — [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Mozart,_Requiem_in_D_minor,_%27Lacrimosa%27_%E2%80%93_piano_arrangement.ogg), CC BY-SA 4.0. Convertida para MP3.
