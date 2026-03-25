#!/usr/bin/env python3
"""
photo-kit.py — Kit de edição de foto para projetos Max Munhoz
Uso: python3 photo-kit.py <input> [opções] -o <output>

Exemplos:
  python3 photo-kit.py foto.jpg --auto -o resultado.jpg
  python3 photo-kit.py foto.jpg --brightness 1.2 --contrast 1.3 --sharpen -o saida.jpg
  python3 photo-kit.py foto.jpg --upscale 2 -o foto_4k.jpg
  python3 photo-kit.py foto.jpg --profile portrait -o retrato.jpg
  python3 photo-kit.py foto.jpg --nobg -o sem_fundo.png
"""

import sys, argparse, os
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import cv2
import numpy as np

# ── PROFILES PRÉ-DEFINIDOS ──────────────────────────────────────────────────
PROFILES = {
    "portrait": dict(brightness=1.08, contrast=1.15, saturation=1.05, sharpen=True,  warmth=8),
    "premium":  dict(brightness=1.05, contrast=1.25, saturation=0.90, sharpen=True,  warmth=0),
    "vivid":    dict(brightness=1.10, contrast=1.30, saturation=1.40, sharpen=True,  warmth=0),
    "matte":    dict(brightness=1.12, contrast=0.88, saturation=0.80, sharpen=False, warmth=0),
    "auto":     dict(brightness=None, contrast=None, saturation=None, sharpen=True,  warmth=0),
}

def load(path):
    img = Image.open(path).convert("RGB")
    print(f"  ✓ carregado: {img.size[0]}×{img.size[1]}px — {os.path.basename(path)}")
    return img

def apply_warmth(img, value):
    """Adiciona tom quente (+) ou frio (-) suavemente."""
    if value == 0:
        return img
    r, g, b = img.split()
    if value > 0:
        r = r.point(lambda p: min(255, p + value))
        b = b.point(lambda p: max(0, p - value // 2))
    else:
        b = b.point(lambda p: min(255, p - value))
        r = r.point(lambda p: max(0, p + value // 2))
    return Image.merge("RGB", (r, g, b))

def auto_levels(img):
    """Estica o histograma por canal (auto levels)."""
    arr = np.array(img, dtype=np.float32)
    out = np.zeros_like(arr)
    for c in range(3):
        ch = arr[:, :, c]
        lo, hi = np.percentile(ch, 1), np.percentile(ch, 99)
        if hi > lo:
            out[:, :, c] = np.clip((ch - lo) / (hi - lo) * 255, 0, 255)
        else:
            out[:, :, c] = ch
    return Image.fromarray(out.astype(np.uint8))

def sharpen(img, amount=1.2):
    """Unsharp mask — mais preciso que o SHARPEN básico do PIL."""
    arr = np.array(img)
    blurred = cv2.GaussianBlur(arr, (0, 0), 3)
    sharp = cv2.addWeighted(arr, 1 + amount, blurred, -amount, 0)
    return Image.fromarray(np.clip(sharp, 0, 255).astype(np.uint8))

def denoise(img, strength=5):
    arr = np.array(img)
    denoised = cv2.fastNlMeansDenoisingColored(arr, None, strength, strength, 7, 21)
    return Image.fromarray(denoised)

def upscale(img, factor, method="lanczos"):
    """Upscale com Lanczos (rápido) ou EDSR via OpenCV DNN (qualidade AI)."""
    w, h = img.size
    new_w, new_h = w * factor, h * factor

    if method == "ai":
        try:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            model_path = os.path.expanduser(f"~/.photo-kit/EDSR_x{factor}.pb")
            if not os.path.exists(model_path):
                print(f"  ⬇  Baixando modelo EDSR x{factor}...")
                os.makedirs(os.path.dirname(model_path), exist_ok=True)
                import urllib.request
                url = f"https://github.com/Saafke/EDSR_Tensorflow/raw/master/models/EDSR_x{factor}.pb"
                urllib.request.urlretrieve(url, model_path)
            sr.readModel(model_path)
            sr.setModel("edsr", factor)
            arr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            result = sr.upsample(arr)
            result = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
            print(f"  ✓ upscale AI (EDSR x{factor}): {result.shape[1]}×{result.shape[0]}px")
            return Image.fromarray(result)
        except Exception as e:
            print(f"  ⚠  EDSR falhou ({e}), usando Lanczos")

    result = img.resize((new_w, new_h), Image.LANCZOS)
    print(f"  ✓ upscale Lanczos x{factor}: {new_w}×{new_h}px")
    return result

def remove_bg(img_path, out_path):
    try:
        from rembg import remove
        with open(img_path, "rb") as f:
            data = f.read()
        result = remove(data)
        with open(out_path, "wb") as f:
            f.write(result)
        print(f"  ✓ fundo removido → {out_path}")
        return True
    except ImportError:
        print("  ✗ rembg não instalado: pip install rembg")
        return False

def save(img, path, quality=92):
    ext = os.path.splitext(path)[1].lower()
    if ext in (".jpg", ".jpeg"):
        img.save(path, "JPEG", quality=quality, optimize=True)
    elif ext == ".png":
        img.save(path, "PNG", optimize=True)
    elif ext == ".webp":
        img.save(path, "WEBP", quality=quality)
    else:
        img.save(path)
    size_kb = os.path.getsize(path) // 1024
    print(f"  ✓ salvo: {path} ({size_kb}KB)")


# ── MAIN ────────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="photo-kit — edição de foto via CLI")
    p.add_argument("input",  help="Imagem de entrada")
    p.add_argument("-o", "--output", required=True, help="Imagem de saída")

    # Ajustes manuais
    p.add_argument("--brightness",  type=float, help="Brilho (1.0 = neutro, >1 mais claro)")
    p.add_argument("--contrast",    type=float, help="Contraste (1.0 = neutro, >1 mais contraste)")
    p.add_argument("--saturation",  type=float, help="Saturação de cor (1.0 = neutro)")
    p.add_argument("--sharpness",   type=float, help="Nitidez PIL (1.0 = neutro)")
    p.add_argument("--sharpen",     action="store_true", help="Unsharp mask (mais preciso)")
    p.add_argument("--sharpen-amt", type=float, default=1.0, help="Força do sharpen (padrão 1.0)")
    p.add_argument("--warmth",      type=int,   default=0,   help="Tom quente (+) ou frio (-)")
    p.add_argument("--denoise",     action="store_true", help="Remover ruído")

    # Auto
    p.add_argument("--auto",    action="store_true", help="Auto levels + sharpen automático")
    p.add_argument("--profile", choices=PROFILES.keys(), help="Perfil pré-definido")

    # Upscale
    p.add_argument("--upscale", type=int, choices=[2, 3, 4], help="Fator de upscale")
    p.add_argument("--ai",      action="store_true", help="Usar EDSR (AI) para upscale")

    # Fundo
    p.add_argument("--nobg", action="store_true", help="Remover fundo (rembg)")

    # Qualidade
    p.add_argument("--quality", type=int, default=92, help="Qualidade JPEG (padrão 92)")

    args = p.parse_args()

    print(f"\nphoto-kit → {args.input}")
    print("─" * 40)

    # Remove fundo antes de tudo se pedido
    if args.nobg:
        nobg_path = os.path.splitext(args.output)[0] + "-nobg.png"
        if remove_bg(args.input, nobg_path):
            args.input = nobg_path

    img = load(args.input)

    # Aplica profile se definido
    opts = {}
    if args.profile:
        opts = PROFILES[args.profile]
        print(f"  ✓ perfil: {args.profile}")
    elif args.auto:
        opts = PROFILES["auto"]
        print(f"  ✓ modo: auto")

    brightness  = args.brightness  or opts.get("brightness")
    contrast    = args.contrast    or opts.get("contrast")
    saturation  = args.saturation  or opts.get("saturation")
    sharpness   = args.sharpness
    do_sharpen  = args.sharpen or opts.get("sharpen", False)
    warmth      = args.warmth  or opts.get("warmth", 0)
    auto_lvl    = args.auto    or opts.get("brightness") is None

    # Auto levels
    if auto_lvl:
        img = auto_levels(img)
        print("  ✓ auto levels aplicado")

    # Ajustes de imagem
    if brightness and brightness != 1.0:
        img = ImageEnhance.Brightness(img).enhance(brightness)
        print(f"  ✓ brilho: ×{brightness}")
    if contrast and contrast != 1.0:
        img = ImageEnhance.Contrast(img).enhance(contrast)
        print(f"  ✓ contraste: ×{contrast}")
    if saturation and saturation != 1.0:
        img = ImageEnhance.Color(img).enhance(saturation)
        print(f"  ✓ saturação: ×{saturation}")
    if sharpness and sharpness != 1.0:
        img = ImageEnhance.Sharpness(img).enhance(sharpness)
        print(f"  ✓ nitidez PIL: ×{sharpness}")
    if warmth != 0:
        img = apply_warmth(img, warmth)
        print(f"  ✓ warmth: {'+' if warmth>0 else ''}{warmth}")
    if args.denoise:
        img = denoise(img)
        print("  ✓ denoise aplicado")
    if do_sharpen:
        img = sharpen(img, args.sharpen_amt)
        print(f"  ✓ unsharp mask (força {args.sharpen_amt})")
    if args.upscale:
        method = "ai" if args.ai else "lanczos"
        img = upscale(img, args.upscale, method)

    save(img, args.output, args.quality)
    print("─" * 40)
    print(f"✅ concluído!\n")


if __name__ == "__main__":
    main()
