# Matheus Andrade — o livro

Portfólio de desenvolvedor front-end em forma de **livro de edição de luxo**.

Ao entrar, um volume encadernado em couro surge sobre a mesa sob um facho de luz; ao toque, a capa se abre em 3D, a folha de rosto aparece e a página vira para o **sumário**. Cada capítulo é uma seção do portfólio.

## Capítulos

| | Capítulo | Conteúdo |
|---|---|---|
| § | Prólogo | Sobre — com capitular, citação e ficha catalográfica |
| I | Arsenal | Stack e princípios, como um índice remissivo |
| II | Obras | Projetos, cada um com uma prancha em guilloché gerada por código |
| III | Jornada | Linha do tempo profissional |
| § | Epílogo | Contato em forma de carta, com assinatura e selo de cera |
| — | Colofão | Os créditos tipográficos do volume |

## Detalhes

- **Livro 3D de verdade**: 10 folhas com frente e verso, profundidade em Z, sombras dinâmicas enquanto a folha vira, bordas do bloco de páginas, pastas maiores que o miolo e marcador de fita.
- **Folhear rápido**: clicar num capítulo do sumário folheia as páginas intermediárias em sequência.
- **Zero imagens**: couro, papel, guardas marmorizadas e grão de filme são filtros SVG procedurais; rosetas, cantoneiras, florões, selo e código de barras são vetores gerados em JS.
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

Cada push na branch `main` publica no **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`).

## Stack

Vite · JavaScript puro · GSAP · CSS 3D transforms · SVG procedural · Canvas 2D
Tipografia: Cormorant Garamond, EB Garamond e Pinyon Script.
