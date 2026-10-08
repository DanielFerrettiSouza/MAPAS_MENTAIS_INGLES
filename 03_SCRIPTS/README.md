# Pipeline de áudio — Mappe Parlanti

Gera o áudio de pronúncia pra cada frase de cada mapa mental e já deixa catalogado no Supabase, pronto pro app consumir. Não precisa gravar ou subir arquivo na mão.

## Passo a passo

1. **Criar as tabelas no Supabase** — rodar o SQL que está em `../02_SPEC_PRODUTO/spec_mvp.md` (seção 2) no seu projeto Supabase.

2. **Criar o bucket de storage** — no painel do Supabase, Storage → New bucket → nome `mind-map-audio` (público), e outro `mind-map-images` (público) pra imagens dos mapas.

3. **Pegar a voz da ElevenLabs** — no painel da ElevenLabs, escolher uma voz nativa britânica (a copy promete "pronuncia britannica"), copiar o Voice ID.

4. **Configurar o ambiente:**
   ```bash
   cd 03_SCRIPTS
   npm install
   cp .env.example .env
   # preencher .env com as chaves da ElevenLabs e do Supabase
   ```

5. **Preencher a planilha de conteúdo** — usar `mapas_A1_exemplo.csv` como modelo. Cada linha é uma frase de um mapa. Colunas:
   - `level` — A1 a C2
   - `topic` — nome do mapa (vira o agrupamento)
   - `order_index` — ordem de exibição do mapa dentro do nível
   - `map_image_filename` — nome do arquivo de imagem do mapa (já deve estar subido no bucket `mind-map-images/<level>/<arquivo>`)
   - `phrase_position` — ordem de reprodução da frase dentro do mapa
   - `phrase_text` — o texto exato que vai ser falado

6. **Rodar:**
   ```bash
   node generate_audio.js mapas_A1_exemplo.csv
   ```

   O script:
   - cria a linha em `mind_maps` na primeira vez que vê um tópico novo
   - gera o áudio de cada frase via ElevenLabs
   - sobe pro Storage e insere em `mind_map_audio`
   - roda de novo com segurança (não duplica mapas já criados — mas duplica áudio se rodar a mesma linha 2x, então evite rodar o mesmo CSV duas vezes sem limpar)

## Custo estimado

ElevenLabs cobra por caractere gerado. Pra ter noção: 300 mapas × ~10 frases × ~15 caracteres médios ≈ 45.000 caracteres — cabe tranquilo nos planos de entrada da ElevenLabs. Rode primeiro só o CSV de exemplo (15 frases) pra validar que a voz e o pipeline estão do jeito que você quer antes de gerar tudo.

## Próximo passo depois de rodar

Preencher o restante do conteúdo (frases de cada mapa, nível por nível) — sugiro começar só pelo nível A1 completo (~50 mapas), conforme definido na spec, antes de produzir os outros 5 níveis.
