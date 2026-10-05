import mapOverview from '../assets/map/map-overview-four-tiles.png';
import chimneySmokeWisp from '../assets/map/chimney-smoke-wisp.png';
import windmillRotor from '../assets/map/windmill-rotor.png';
import { mapSizes, type MapLayout } from './layout';

export interface WorldArtProps {
  layout: MapLayout;
  className?: string;
}

const sourceWidth = 3608;
const sourceHeight = 1540;
const rotorSize = 160;
const rotorHub = { x: 2000, y: 158 };
const smokeChimneys = [
  { x: 269, y: 165 },
  { x: 1864, y: 198 },
  { x: 1947, y: 395 },
  { x: 2146, y: 194 },
  { x: 3460, y: 249 },
];

/** 承認済みの一枚地図へ、取り除いた煙と風車の羽根だけを重ねる。 */
export function WorldArt({ layout, className }: WorldArtProps) {
  const { width, height } = mapSizes[layout];
  const smokeWidth = 90;
  const smokeHeight = 160;

  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <image href={mapOverview} x="0" y="0" width={width} height={height} preserveAspectRatio="none" />
      <image
        className="windmill-rotor"
        href={windmillRotor}
        x={(rotorHub.x - rotorSize * .53) / sourceWidth * width}
        y={(rotorHub.y - rotorSize * .509) / sourceHeight * height}
        width={rotorSize / sourceWidth * width}
        height={rotorSize / sourceHeight * height}
      />
      {smokeChimneys.map(({ x, y }) => (
        <g key={`${x}-${y}`} className="chimney-smoke-preview">
          {[0, 1, 2].map((index) => (
            <image
              key={index}
              href={chimneySmokeWisp}
              x={(x - smokeWidth * .38) / sourceWidth * width}
              y={(y - smokeHeight) / sourceHeight * height}
              width={smokeWidth / sourceWidth * width}
              height={smokeHeight / sourceHeight * height}
              preserveAspectRatio="none"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
