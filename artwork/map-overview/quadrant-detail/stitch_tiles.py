"""Preserve generated tile pixels; use minimum-difference seams in overlaps."""
from pathlib import Path
from PIL import Image, ImageFilter
p = Path(__file__).parent
W, H = 1894, 830
# Original overlapping source bounds were 1008x441 (top) /1008x442 (bottom).
OX, OY = round(W * 96 / 1008), round(H * 64 / 442)

def join(a, b, overlap):
    h = a.height
    left = a.crop((a.width-overlap, 0, a.width, h))
    right = b.crop((0, 0, overlap, h))
    cw, ch = max(2, overlap//3), max(2, h//3)
    aa = left.resize((cw,ch)).convert('RGB'); bb = right.resize((cw,ch)).convert('RGB')
    ap, bp = aa.load(), bb.load()
    history=[]; previous=[0]*cw
    for y in range(ch):
        row=[]; back=[]
        for x in range(cw):
            cost=sum(abs(ap[x,y][k]-bp[x,y][k]) for k in range(3))
            candidates=range(max(0,x-1),min(cw,x+2))
            parent=min(candidates,key=lambda j: previous[j]+(4 if j!=x else 0))
            row.append(cost+previous[parent]); back.append(parent)
        previous=row; history.append(back)
    x=min(range(cw),key=lambda j:previous[j]); seam=[x]
    for y in range(ch-1,0,-1):
        x=history[y][x]; seam.append(x)
    seam.reverse()
    mask=Image.new('L',(overlap,h),0); mp=mask.load()
    for y in range(h):
        sx=round((seam[min(ch-1,y*ch//h)]+.5)*overlap/cw)
        for x in range(sx,overlap): mp[x,y]=255
    mask=mask.filter(ImageFilter.GaussianBlur(1.2))
    combined=Image.composite(right,left,mask)
    out=Image.new('RGB',(a.width+b.width-overlap,h))
    out.paste(a,(0,0)); out.paste(b,(a.width-overlap,0)); out.paste(combined,(a.width-overlap,0))
    return out

def tile(name):
    im=Image.open(p/f'detail-{name}-v1.png').convert('RGB')
    # Only 1px normalization between generated tiles, no global recreation.
    return im if im.size==(W,H) else im.resize((W,H),Image.Resampling.LANCZOS)
top=join(tile('nw'),tile('ne'),OX)
bottom=join(tile('sw'),tile('se'),OX)
result=join(top.transpose(Image.Transpose.TRANSPOSE),bottom.transpose(Image.Transpose.TRANSPOSE),OY).transpose(Image.Transpose.TRANSPOSE)
output=p.parent/'map-overview-four-tiles-composite-v1.png'
result.save(output)
print(f'{output}: {result.width}x{result.height}, overlap {OX}x{OY}')
