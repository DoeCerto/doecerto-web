async function testCsp() {
  console.log('========================================================================');
  console.log('🛡️  VERIFICAÇÃO DE SEGURANÇA: CSP COM NONCE NO NEXT.JS (WEB)');
  console.log('========================================================================\n');

  let passed = 0;
  const total = 3;

  try {
    // -------------------------------------------------------------------------
    // TESTE 1: Presença do cabeçalho Content-Security-Policy com nonce dinâmico
    // -------------------------------------------------------------------------
    console.log('🧪 Teste 1: Next.js servindo Content-Security-Policy com nonce dinâmico...');
    const res1 = await fetch('http://localhost:3000/');
    const csp1 = res1.headers.get('content-security-policy');
    const nonce1 = res1.headers.get('x-nonce');

    if (
      csp1 &&
      csp1.includes('nonce-') &&
      csp1.includes("'strict-dynamic'") &&
      nonce1 &&
      nonce1.length > 20
    ) {
      console.log(`   ✅ PASSOU: Header CSP presente no Next.js com nonce e 'strict-dynamic':\n` +
                  `              Nonce: ${nonce1}\n` +
                  `              CSP snippet: ${csp1.substring(0, 110)}...\n`);
      passed++;
    } else {
      console.error(`   ❌ FALHOU: Header CSP ausente ou incompleto: csp=${csp1}, nonce=${nonce1}\n`);
    }

    // -------------------------------------------------------------------------
    // TESTE 2: Nonce rotativo único por requisição (anti-replay)
    // -------------------------------------------------------------------------
    console.log('🧪 Teste 2: Next.js gerando nonces criptográficos únicos por requisição...');
    const res2 = await fetch('http://localhost:3000/');
    const nonce2 = res2.headers.get('x-nonce');

    if (nonce1 && nonce2 && nonce1 !== nonce2) {
      console.log(`   ✅ PASSOU: Nonces dinâmicos rotacionados a cada requisição:\n` +
                  `              Req 1 Nonce: ${nonce1}\n` +
                  `              Req 2 Nonce: ${nonce2}\n`);
      passed++;
    } else {
      console.error(`   ❌ FALHOU: Nonces duplicados ou estáticos: nonce1=${nonce1}, nonce2=${nonce2}\n`);
    }

    // -------------------------------------------------------------------------
    // TESTE 3: Diretivas essenciais de defesa anti-XSS e anti-Clickjacking
    // -------------------------------------------------------------------------
    console.log('🧪 Teste 3: Next.js aplicando restrições rígidas (anti-Clickjacking, object-src)...');
    const hasObjectNone = csp1.includes("object-src 'none'");
    const hasFrameAncestorsNone = csp1.includes("frame-ancestors 'none'");
    const hasBaseUriSelf = csp1.includes("base-uri 'self'");

    if (hasObjectNone && hasFrameAncestorsNone && hasBaseUriSelf) {
      console.log(`   ✅ PASSOU: Diretivas 'object-src \\'none\\'', 'frame-ancestors \\'none\\'' e 'base-uri \\'self\\'' ativas.\n`);
      passed++;
    } else {
      console.error(`   ❌ FALHOU: Diretivas de segurança ausentes no CSP.\n`);
    }

  } catch (err) {
    console.error('Erro ao executar testes do frontend:', err);
  }

  console.log('========================================================================');
  console.log(`📊 RESULTADO NEXT.JS CSP: ${passed}/${total} TESTES APROVADOS (${(passed / total) * 100}%)`);
  console.log('========================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

testCsp();
