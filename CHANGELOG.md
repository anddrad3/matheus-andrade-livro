# Changelog

Todas as versões do livro-portfólio. Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/); versões em [SemVer](https://semver.org/lang/pt-BR/).

## [3.3.0] — 2026-11-14
### Adicionado
- **Folha maleável**: ao virar, a página curva como papel de verdade (tira de faixas encadeadas); levantada por baixo ou por cima, o canto puxado vai à frente. Vale para arrastar, clicar nos cantos e usar as setas.
- **Páginas escritas em tempo real**: o texto surge palavra a palavra, na ordem de leitura e no ritmo certo para cada página (~1,7 s); imagens e ornamentos são desenhados como esboço que ganha cor. Nada bloqueia a interação; respeita movimento reduzido.
- **Isqueiro** e **bloco de notas** na mesa (com falas por tema); fumaça do cigarro **contínua** (três fios defasados).
- Clicar na **foto do projeto** também faz o mergulho de câmera até o site.
- **Lombada traseira** com o livro aberto (no 360° as capas não ficam mais soltas).
### Alterado
- Arrastar a página completa a virada quando o ponteiro cruza a lombada.
- 360° mais solto no computador (atravessar a tela = uma volta) e sem paralaxe brigando com o giro.
- Cards flutuantes (avisos, volume, balões) totalmente opacos.
### Corrigido
- Revelação das páginas não animava desde a 3.2 (página marcada visível enquanto ainda "pulada" pelo navegador).
- **Trilha atrasando**: as faixas tinham 0,6 s e 1,3 s de silêncio no início — cortados; a faixa começa a baixar já no `<head>` e o fade de entrada caiu para 0,25 s.

## [3.2.0] — 2026-11-14
### Adicionado
- Dois novos objetos na mesa: **copo de whisky** (com gelo no clássico, puro na Sombria) e **cigarro no cinzeiro** com fumaça animada — na cutscene e, depois, clicáveis.
- Objetos chamam o dono de **Matheus** no tema claro e de **Andrade** no escuro.
- **Controle de volume** da trilha (deslizante 0–100 + mudo), no topo e no menu do celular; volume lembrado entre visitas.
- Botão **"voltar ao livro"** no modo 360°.
- `npm run textures`: gera as texturas como WebP (`public/tex/`).
### Alterado
- A trilha começa **no instante em que o site abre**; se o navegador bloquear áudio automático, um aviso discreto pede um toque e ela começa nele.
- O **360° virou um modo**: desligado por padrão; ao ligar, arrastar em qualquer lugar gira (mouse ou dedo) e o folhear pausa — sem giros acidentais.
- Livro fechado no 360° ganhou **lombada** de couro com nervuras (antes aparecia um degrau oco).
### Desempenho
- Texturas pré-renderizadas em WebP no lugar de filtros SVG calculados no aparelho.
- Folhas fora de vista com `content-visibility: hidden` desde o carregamento.
- Rosetas guilloché com ~1/3 dos pontos e cache; espessura do 360° sem recalcular a página inteira.
- Resultado medido (celular simulado com CPU 4× mais lenta): tempo de bloqueio ao abrir **3,3 s → 0,9 s**; no computador **0,8 s → 0,06 s**.
### Corrigido
- Música engasgando: troca de faixa e volume sem conflito entre fades.

## [3.1.0] — 2026-11-14
- "Visitar a obra" com **mergulho de câmera** na prancha do site e abertura na mesma aba.
- Texturas refinadas (papel envelhecido, lombada, volume do miolo, páginas negras).
- Marca M·A e favicon no dourado nos dois temas.

## [3.0.0] — 2026-11-14
- **Trilha ao piano** por tema (Bach no claro, Mozart no escuro).
- Objetos da mesa clicáveis com falas por tema; **tema escuro como padrão**.
- Virar página **arrastando** (estilo iPad) e deslizando o dedo no celular.
- **Menu inferior** no celular; botão para **reiniciar a abertura**.

## [2.2.0] — 2026-11-14
- **Tema claro (clássico) × escuro (Edição Sombria)** com botão; caveira gravada de Dürer na capa sombria.

## [2.1.0] — 2026-11-14
- Edição Sombria (preto, prata e vermelho), 360° com liga/desliga e miolo espesso.
- Virar a página arrastando o canto; ganhos de desempenho; cutscene de abertura com mesa e luminária; giro 360°.

## [2.0.0] — 2026-11-14
- Segunda edição: conteúdo real do GitHub e do README, pranchas fotográficas, abas, marginália, som de papel e diário de bordo.

## [1.0.0] — 2026-11-14
- Primeira edição: livro 3D com abertura, sumário e capítulos; deploy no GitHub Pages e no alwaysdata.
