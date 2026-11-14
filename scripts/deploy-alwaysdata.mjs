/**
 * Publica o build no alwaysdata via SSH (chave em ~/.ssh/alwaysdata_deploy).
 * Uso: npm run deploy
 *
 * Envia para uma pasta temporária e troca de uma vez, para o site
 * nunca ficar pela metade durante o upload.
 */
import { execFileSync, execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';

const HOST = process.env.AD_HOST ?? 'matityahu@ssh-matityahu.alwaysdata.net';
const DIR = process.env.AD_DIR ?? 'www/dev-matheus-andrade';
const KEY = process.env.AD_KEY ?? join(homedir(), '.ssh', 'alwaysdata_deploy');
const URL = process.env.AD_URL ?? 'https://matityahu.alwaysdata.net/dev-matheus-andrade/';

if (!existsSync(KEY)) {
  console.error(`Chave SSH não encontrada em ${KEY}`);
  process.exit(1);
}

const sshOpts = ['-i', KEY, '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new'];
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });
const tmp = `${DIR}.__novo`;

console.log('› build');
execSync('npm run build', { stdio: 'inherit' });

console.log(`› enviando para ${HOST}:${DIR}`);
run('ssh', [...sshOpts, HOST, `rm -rf ~/${tmp} && mkdir -p ~/${tmp}`]);
// envia tudo o que o build gerou (index.html, assets/, plates/…)
const entries = readdirSync('dist').map((f) => `dist/${f}`);
run('scp', [...sshOpts, '-r', '-q', ...entries, `${HOST}:${tmp}/`]);
run('ssh', [...sshOpts, HOST, `rm -rf ~/${DIR}.__antigo && (test -d ~/${DIR} && mv ~/${DIR} ~/${DIR}.__antigo || true) && mv ~/${tmp} ~/${DIR} && rm -rf ~/${DIR}.__antigo`]);

console.log(`✓ publicado: ${URL}`);
