---
name: photo-kit
description: "Photo editing, calibration, and enhancement via CLI. Use when the user wants to adjust brightness, contrast, saturation, sharpen, apply color warmth, remove background, upscale, denoise, or apply a photo profile (portrait, premium, vivid, matte, auto). Triggers on: 'calibrar foto', 'ajustar contraste', 'aumentar brilho', 'remover fundo', 'upscale imagem', 'melhorar qualidade da foto', 'auto levels', 'warmth', 'sharpen', 'photo profile', 'editar foto via terminal', 'foto mais vívida', 'foto premium', 'foto retrato'. The tool is photo-kit.py at /Users/maxmunhoz/Projects/photo-kit.py"
metadata:
  version: 1.0.0
---

# Photo Kit

Kit de edição e calibração de foto via CLI para projetos Max Munhoz.

**Script:** `python3 /Users/maxmunhoz/Projects/photo-kit.py`

## Uso básico

```bash
python3 /Users/maxmunhoz/Projects/photo-kit.py <input> [opções] -o <output>
```

## Profiles pré-definidos

| Profile | Uso ideal | O que faz |
|---------|-----------|-----------|
| `portrait` | Foto de rosto/perfil | brightness+8%, contrast+15%, saturation+5%, sharpen, warmth+8 |
| `premium` | Produto, institucional | brightness+5%, contrast+25%, saturation-10% (clean), sharpen |
| `vivid` | Redes sociais, feed | brightness+10%, contrast+30%, saturation+40%, sharpen |
| `matte` | Estilo cinematográfico | brightness+12%, contrast-12%, saturation-20%, soft |
| `auto` | Correção geral automática | auto levels + sharpen |

```bash
# Aplicar profile
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --profile portrait -o resultado.jpg
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --profile vivid -o vivid.jpg
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --auto -o auto.jpg
```

## Ajustes manuais

```bash
# Brilho, contraste, saturação (1.0 = neutro)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg \
  --brightness 1.2 \
  --contrast 1.3 \
  --saturation 1.1 \
  -o saida.jpg

# Tom quente/frio (positivo = quente/alaranjado, negativo = frio/azulado)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --warmth 12 -o quente.jpg
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --warmth -10 -o frio.jpg

# Nitidez — dois modos:
# --sharpness: ajuste PIL simples (1.0 = neutro)
# --sharpen: unsharp mask via cv2 (mais preciso, padrão de editores)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --sharpen -o sharp.jpg
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --sharpen --sharpen-amt 1.5 -o extra-sharp.jpg

# Denoise (remove ruído/granulação)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --denoise -o sem-ruido.jpg
```

## Upscale (aumentar resolução)

```bash
# Lanczos (rápido, boa qualidade)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --upscale 2 -o foto_2x.jpg
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --upscale 4 -o foto_4k.jpg

# AI via EDSR (melhor qualidade — baixa modelo ~100MB na 1ª vez)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --upscale 2 --ai -o foto_ai.jpg
```

## Remoção de fundo

```bash
# Remove fundo (usa rembg + onnxruntime — baixa modelo u2net na 1ª vez ~170MB)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --nobg -o foto.png
# Gera automaticamente: foto-nobg.png (transparente)
```

## Qualidade de saída

```bash
# JPEG quality (padrão 92, range 1-100)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --quality 95 -o alta-qualidade.jpg
```

## Combinações recomendadas

```bash
# Perfil + warmth manual
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --profile portrait --warmth 5 -o retrato.jpg

# Upscale + sharpen (melhorar foto pequena)
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --upscale 2 --sharpen -o foto-melhorada.jpg

# Remover fundo + profile premium (foto produto)
python3 /Users/maxmunhoz/Projects/photo-kit.py produto.jpg --nobg --profile premium -o produto-nobg.jpg

# Pipeline completo: auto levels + sharpen + qualidade máxima
python3 /Users/maxmunhoz/Projects/photo-kit.py foto.jpg --auto --quality 98 -o final.jpg
```

## Como usar esta skill

Quando o usuário pedir para editar/calibrar uma foto:

1. **Identifique o objetivo** — é uma foto de perfil? produto? redes sociais? feed? capa?
2. **Sugira o profile mais adequado** ou pergunte se quer ajustes manuais
3. **Execute o comando** com os parâmetros corretos
4. **Informe o resultado** — tamanho do arquivo e resolução após processamento

### Perguntas guia quando o usuário não especifica:

- "Qual é o uso da foto? (perfil, produto, redes sociais, site...)"
- "Quer remover o fundo?"
- "Precisa de upscale? (ampliar para 2x, 3x ou 4x)"
- "Prefere tom mais quente (alaranjado) ou mais frio?"

## Dependências

Todas já instaladas no Mac do Max:
- `Pillow` (PIL) — manipulação de imagem
- `opencv-python` (cv2 4.13.0) — sharpen, denoise, upscale AI
- `numpy` — processamento matricial
- `rembg` + `onnxruntime` — remoção de fundo (requer internet na 1ª vez para baixar modelo)

## Formatos suportados

**Entrada:** JPG, JPEG, PNG, WEBP, BMP, TIFF e qualquer formato suportado pelo PIL
**Saída:** preserva formato de acordo com extensão do `-o`
- `.jpg`/`.jpeg` → JPEG otimizado
- `.png` → PNG otimizado
- `.webp` → WebP

> **Dica:** Para remoção de fundo (`--nobg`), sempre use `.png` na saída para preservar transparência.
