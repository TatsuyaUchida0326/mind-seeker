"""地図素材から「光る道レイヤー」と「街から街への道順」を作る。

入力
  src/assets/map/map-base.png … 道が光っていない地図
  artwork/maps/archive/map-golden.png … 同じ構図で、道が金色に光っている地図
  src/stages.ts  … 街の座標（SVG viewBox 1920x1080 上）

出力
  src/routeWaypoints.json … （2026-09-25 時点ではアプリから使っていない。道の演出を戻すときに使う）前の街 → 次の街の経由点（SVG 座標）。金色版で光っている道の上を優先して通る最短経路を間引いたもの
画面では map-golden.png を map-base.png に重ね、この経由点に沿った帯の部分だけをマスクで見せる。

地図を差し替えたら、2枚の素材を置き換えてこのスクリプトを実行し直す。
必要なライブラリ: numpy, scipy, scikit-image, pillow（例: python3 -m venv .venv && .venv/bin/pip install numpy scipy scikit-image pillow）
実行: .venv/bin/python scripts/build_map_routes.py
"""

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.graph import route_through_array

ROOT = Path(__file__).resolve().parent.parent
BASE_MAP = ROOT / 'src' / 'assets' / 'map' / 'map-base.png'
GOLDEN_MAP = ROOT / 'artwork' / 'maps' / 'archive' / 'map-golden.png'
SVG_WIDTH, SVG_HEIGHT = 1920, 1080

# 金色版で「金色かつ明るくなった」画素を道とみなす
GOLD_MIN_RED, GOLD_MIN_GREEN, GOLD_MAX_BLUE, GOLD_MIN_RED_MINUS_BLUE = 170, 130, 160, 50
MIN_BRIGHTENING = 12

# 経路探索: 道の上は安く、道以外は高く。道の切れ目は膨張でつなぐ
ROUTING_SCALE = 0.5
ROAD_GAP_CLOSING_PX = 2
COST_ON_ROAD, COST_OFF_ROAD = 1.0, 40.0
SIMPLIFY_TOLERANCE_SVG = 6.0  # 経由点を間引く許容誤差（SVG 座標）


def load_rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert('RGB')).astype(np.int16)


def load_stages() -> list[tuple[str, float, float]]:
    source = (ROOT / 'src' / 'stages.ts').read_text(encoding='utf-8')
    pattern = r"id: '(stage-\d+)', name: '[^']+', x: ([\d.]+), y: ([\d.]+)"
    return [(m.group(1), float(m.group(2)), float(m.group(3))) for m in re.finditer(pattern, source)]


def find_road_pixels(base: np.ndarray, golden: np.ndarray) -> np.ndarray:
    red, green, blue = golden[..., 0], golden[..., 1], golden[..., 2]
    is_gold = (red > GOLD_MIN_RED) & (green > GOLD_MIN_GREEN) & (blue < GOLD_MAX_BLUE) & (red - blue > GOLD_MIN_RED_MINUS_BLUE)
    brightened = golden.mean(axis=2) - base.mean(axis=2) > MIN_BRIGHTENING
    return is_gold & brightened


def build_cost_grid(road: np.ndarray) -> np.ndarray:
    small = Image.fromarray((road * 255).astype(np.uint8)).resize(
        (round(road.shape[1] * ROUTING_SCALE), round(road.shape[0] * ROUTING_SCALE)), Image.BILINEAR)
    road_small = ndimage.binary_dilation(np.asarray(small) > 40, iterations=ROAD_GAP_CLOSING_PX)
    return np.where(road_small, COST_ON_ROAD, COST_OFF_ROAD)


def simplify(points: list[tuple[float, float]], tolerance: float) -> list[tuple[float, float]]:
    """Ramer–Douglas–Peucker で折れ線を間引く"""
    if len(points) < 3:
        return points
    start, end = np.array(points[0]), np.array(points[-1])
    segment = end - start
    length = np.hypot(*segment) or 1.0
    distances = [abs(segment[0] * (p[1] - start[1]) - segment[1] * (p[0] - start[0])) / length for p in points[1:-1]]
    farthest = int(np.argmax(distances)) + 1
    if distances[farthest - 1] <= tolerance:
        return [points[0], points[-1]]
    return simplify(points[:farthest + 1], tolerance)[:-1] + simplify(points[farthest:], tolerance)


def find_route(cost: np.ndarray, image_size: tuple[int, int], start_svg, end_svg) -> list[dict]:
    width, height = image_size
    to_grid = lambda x, y: (int(y / SVG_HEIGHT * height * ROUTING_SCALE), int(x / SVG_WIDTH * width * ROUTING_SCALE))
    to_svg = lambda row, col: (col / ROUTING_SCALE / width * SVG_WIDTH, row / ROUTING_SCALE / height * SVG_HEIGHT)
    path, _ = route_through_array(cost, to_grid(*start_svg), to_grid(*end_svg), fully_connected=True, geometric=True)
    svg_points = simplify([to_svg(row, col) for row, col in path], SIMPLIFY_TOLERANCE_SVG)
    # 両端は街の位置そのものなので、経由点には含めない
    return [{'x': round(x, 1), 'y': round(y, 1)} for x, y in svg_points[1:-1]]


def main() -> None:
    base, golden = load_rgb(BASE_MAP), load_rgb(GOLDEN_MAP)
    if base.shape != golden.shape:
        raise SystemExit(f'2枚の地図のサイズが違う: {base.shape} / {golden.shape}')
    road = find_road_pixels(base, golden)
    cost = build_cost_grid(road)
    image_size = (base.shape[1], base.shape[0])
    stages = load_stages()
    waypoints = {}
    for (_, x0, y0), (stage_id, x1, y1) in zip(stages, stages[1:]):
        waypoints[stage_id] = find_route(cost, image_size, (x0, y0), (x1, y1))
    (ROOT / 'src' / 'routeWaypoints.json').write_text(json.dumps(waypoints, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'道の画素: {road.mean() * 100:.2f}%  区間: {len(waypoints)}  経由点の合計: {sum(len(v) for v in waypoints.values())}')


if __name__ == '__main__':
    main()
