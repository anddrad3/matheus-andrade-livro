/**
 * Conteúdo do livro no idioma escolhido.
 * O texto em si está em content.pt.js (português) e content.en.js (inglês).
 */
import { EN } from './lang.js';
import * as pt from './content.pt.js';
import * as en from './content.en.js';

const C = EN ? en : pt;

export const { github, author, prologue, arsenal, works, formation, epilogue, diary, colophon, index, deskTalk } = C;
