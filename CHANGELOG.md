# Changelog

Todas as versões do livro-portfólio. Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/); versões em [SemVer](https://semver.org/lang/pt-BR/).

## [4.3.0] — 2026-11-14
### Alterado
- **Roda do mouse = zoom**: no computador a roda aproxima e afasta o livro em torno do cursor (antes folheava). Com o livro fechado, rolar para baixo ainda abre.
- **Virar com um clique**: clicar na página vira — direita avança, esquerda volta (a folha levanta pelo canto mais perto do clique). No celular, um toque avança; no terço esquerdo, volta. Links, abas, fotos e botões continuam funcionando normalmente; arrastar continua virando também.
### Removido
- Botões de zoom (− 100% +) do topo.

## [4.2.0] — 2026-11-14
### Alterado
- **Música desde o início**: se o navegador libera som automático, a abertura já começa tocando; se bloqueia (regra de todos os navegadores: som só depois de um gesto na página), o monograma da entrada pede “toque para abrir o livro ♪” — e esse toque liga a trilha e dá a partida na cena ao mesmo tempo, em vez de a cena rodar muda.
### Desempenho (travadas no celular)
- **Virar a página**: a página que chega é desenhada já, mas escrita (palavras, desenhos, gravuras) só quando a folha assenta — nada mais é repintado no meio da virada (pintura −47% durante o movimento).
- Sombra projetada pela folha agora é uma faixa que só desliza (antes um degradê redesenhado a cada quadro); faixas da folha maleável em camadas próprias.
- **Troca de cena da abertura**: o clarão-estrela (camada de 160vmax que cresce até 3×) não tem mais desfoque — a GPU refazia o filtro a cada quadro; câmera e livro em camadas próprias durante a cena.
- Feixe de luz do fundo sem desfoque nem modo de mistura (camada de tela inteira recomposta em toda animação); mesa sem máscara.
- Objetos da mesa: sombra do cinzeiro no desenho (não sobre a fumaça animada) e a animação de entrada não prende mais cada objeto numa camada.

## [4.1.0] — 2026-11-14
### Adicionado
- **Português e inglês**: o livro inteiro (páginas, objetos, celular, botões, avisos) existe nas duas línguas. Na primeira visita segue o idioma do aparelho; o interruptor discreto **PT ⇄ EN** no topo troca e a escolha fica guardada. README também em inglês (`README.en.md`).
- **Tema do aparelho**: claro → edição clássica, escuro → Edição Sombria (antes era sempre a Sombria). A troca pelo botão vale durante a visita; se o aparelho muda de tema (modo escuro automático), o livro acompanha.
- **Botão “2 páginas” no celular**: a pessoa escolhe ver uma ou duas páginas — girar o aparelho não muda mais o modo sozinho. Com o celular em pé, duas páginas deitam o livro na tela; deitado, aparecem lado a lado. Uma página também funciona com o celular deitado.
- **Zoom no computador**: botões **− 100% +** no topo e teclas `+` `−` `0` (além de Ctrl + roda).
### Alterado
- **Cigarro apagado na edição clássica** (sem fumaça nem brasa, com falas novas); aceso e fumegando só na Sombria.
- O livro não se abre mais sozinho: o toque que abre também libera a música.
- Abertura um pouco mais curta.
### Corrigido
- **360° no celular**: arrastar sobre o livro (e sobre os objetos) agora gira; antes só funcionava num cantinho livre da mesa.
- **Card dos objetos**: um toque não dispara giros, a inércia é limitada (no máximo ~meia volta) e não briga mais com o arrasto.
- **Rolar dentro do celular** (ou de um card) não folheia mais o livro; teclas também ficam com o card aberto.
- **Acentos quebrados** em textos da interface (ex.: “1 â€“ 2” no número da página), causados por uma regravação com codificação errada na 4.0.0.
### Desempenho (relatórios do PageSpeed)
- **CLS 0,208 → 0**: o palco só aparece depois de medido; gravuras e fotos com `width`/`height`.
- **LCP**: a primeira pintura é um monograma grande em fonte do sistema (antes o LCP era a folha de rosto ou o couro da contracapa pintados no fim da cena, ~13–19 s no celular); as folhas do miolo são preparadas cedo, em etapas pequenas.
- Fontes do Google sem bloquear a renderização; `maximum-scale` removido do viewport (acessibilidade: o zoom do navegador volta a funcionar).
- Peso inicial bem menor: trilhas em MP3 mono de 80 kbps (5,6 → 3,5 MB), a trilha do outro tema não é mais pré-carregada, gravuras do outro tema só sob demanda, caveira e assinatura em WebP, diário do GitHub só quando o leitor se aproxima (sem erro no console de quem só abre a página).
- Cache de um ano para imagens e trilhas.
- Mesa da abertura: a textura só onde a vinheta deixa ver (antes um quadrado de 340vmax inteiro, a maior camada da cena).
- Celular: sem grão de filme e sem poeira em canvas (camadas de tela cheia), folha maleável com 4 faixas.

## [4.0.0] — 2026-11-14
### Celular redesenhado
- **Barra de ajustes no rodapé**, como nos apps: tema, música, som das páginas, 360° e reiniciar a abertura. Com o celular deitado, vira um trilho na lateral. O menu de cima saiu; no topo ficam só o monograma e onde você está (capítulo e fólio).
- **Uma página por vez** com o celular em pé, centralizada, e a **mesa com os objetos à mostra** em cima e embaixo, como no computador.
- **Tocar na página deita o livro**: as duas páginas aparecem inteiras, giradas, e é só virar o aparelho. Outro toque (ou "uma página") volta. Girar o celular de verdade também mostra as duas páginas, já com os objetos dos lados.
- **Pinça para aproximar e afastar** (com elasticidade nos limites); aproximado, um dedo passeia pela página; "tamanho original" volta. No computador: Ctrl + roda ou pinça do trackpad, e Esc volta.
- **Abas do livro** (Capa, capítulos, Fim) também no celular.
### Adicionado
- **Celular na mesa**: abre num app de música com a faixa que está tocando em cada edição, um texto sobre ela e a capa com uma gravura de Gustave Doré para a *Divina Comédia*: a **Rosa Celeste do Paraíso** (Canto XXXI) na clássica e **Lúcifer no gelo do Inferno** (Canto XXXIV) na Sombria. App claro na clássica, escuro na Sombria. Pausar, voltar ao começo, arrastar a faixa, volume, som das páginas e trocar de edição, tudo pelo aparelho. O botão de música (barra do celular ou topo do computador) abre o celular.
- **Reiniciar a abertura reinicia a música** junto.
### Desempenho
- Virar páginas ficou **~3,5× mais leve no celular** e ~2× no computador (medido com CPU 4× mais lenta: 15 → 53–59 quadros/s). A sombra da folha e a curvatura mudavam variáveis CSS herdadas por centenas de palavras a cada quadro; agora mudam só a opacidade de elementos pequenos.
- Animações que rodavam escondidas (convite de abrir, pontinhos do portal, luminária, fumaça antiga) deixaram de forçar um recálculo de estilo por quadro com o livro parado.
- Fumaça e brasa do cigarro refeitas em HTML (animação na GPU).
- Folhas fora de vista não ocupam memória de vídeo (no iPhone, camadas demais faziam imagens "sumirem").
### Corrigido
- **Imagens que demoravam ou não apareciam**: o servidor não mandava cabeçalhos de cache, então cada imagem era revalidada a cada visita. Agora há `.htaccess` com cache longo para imagens, música e arquivos do build. O pré-carregamento decodifica só as imagens do tema atual, uma de cada vez, em vez de todas juntas.
- **Objetos e livro "travados" ao voltar** depois de abrir um projeto ou trocar de aba: gestos presos (o dedo saiu da tela em outra aba) são desfeitos, o mergulho do portal é encerrado e as medidas, refeitas. Medidas falsas informadas com a aba em segundo plano são ignoradas.

## [3.5.0] — 2026-11-14
### Adicionado
- **Gravuras de domínio público** nas aberturas de capítulo e no colofão, uma série por tema: Clássica — Dürer (*São Jerônimo no estudo*, *Melencolia I*), Flammarion e a oficina do impressor de Jost Amman (1568); Sombria — Gustave Doré, ilustrações de *O Corvo* de Poe (1884). Cada uma com crédito.
- **Etiquetas "Capa" e "Fim"** nas abas laterais.
- **Card dos objetos da mesa**: clicar abre o objeto grande, com espessura em 3D, girável em 360° (mouse ou dedo), com as falas e "outra história". Funciona também no modo 360° e pelo menu do celular.
### Alterado
- **Nova assinatura oficial**, inteira (verificado: nenhum traço encosta nas bordas nem é cortado pela página).
- **Modo 360°**: com o livro de frente, arrastar a página folheia; arrastar fora do livro gira; o giro trava no eixo dominante do gesto. A volta de apresentação termina de frente.
- Objetos da mesa ficam visíveis no modo 360°.
### Desempenho
- Fotos dos projetos em WebP (3× menores) e sem carregamento preguiçoso; fotos, gravuras, texturas e trilha do outro tema pré-carregadas enquanto o livro levita — imagens já prontas ao virar a página e troca clássico/sombrio imediata.

## [3.4.1] — 2026-11-14
### Corrigido
- "FULL STACK" cortado na folha de rosto.
- Abertura travando: o verso do livro é pintado de antemão (sob o véu preto inicial), as primeiras páginas são preparadas durante a levitação e a troca de cena acontece com a luz cobrindo a tela. Medido: ~38 → ~58 quadros/s, sem engasgos visíveis.
- O giro mostrava a página aberta (a escrita das primeiras páginas era montada no meio do giro); agora só capa, lombada e contracapa aparecem até a capa abrir.
### Alterado
- Giro com aceleração e chegada suaves, emendando direto na abertura da capa (sem parada).

## [3.4.0] — 2026-11-14
### Adicionado
- **Nova abertura** no estilo "livro mágico": o livro levita sobre a mesa, dá uma volta completa no ar, a capa se abre de supetão enquanto a câmera mergulha na folha de rosto e uma estrela de luz faz a passagem para o livro aberto.
- **Assinatura oficial** do Matheus na carta (imagem própria, engrossada, escrita da esquerda para a direita; azul-tinta no clássico, vermelho-sangue na Sombria).
- **Celular: as duas páginas inteiras na tela** + **modo leitura**: toque numa página para aproximar; deslizar passa para a outra página e, no fim do espelho, vira a folha; "ver as duas páginas" volta.
- Marca **M·A** e **ícone da aba** próprios da Edição Sombria (prata, letra gótica, ponto vermelho), trocando junto com o tema.
### Alterado
- Página **muito mais maleável** (curvatura ~2× maior, concentrada na borda, 10 faixas).
- "Visitar a obra" e a foto do projeto abrem o site **em nova aba**; o livro desfaz o mergulho e continua onde estava.
- Trilha: começa a tocar (muda) desde o primeiro instante e o som entra assim que o navegador permitir — sem aviso na tela.
### Corrigido
- Nome quebrado na folha de rosto ("THE DRA LL STA") e espaços extras em links, causados pela escrita palavra a palavra.

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
