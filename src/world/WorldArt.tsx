import grasslandWorldSection from '../assets/map/grassland-world-section.png';
import grasslandEastSection from '../assets/map/grassland-east-section-v2.png';
import grasslandRiversideSection from '../assets/map/grassland-riverside-section.png';
import grasslandSouthRiversideSection from '../assets/map/grassland-south-riverside-section.png';
import grasslandSouthwestSection from '../assets/map/grassland-southwest-section.png';
import grasslandSouthwestRoadRepaired from '../assets/map/grassland-southwest-road-repaired.png';
import grasslandSouthcentralSection from '../assets/map/grassland-southcentral-seam-repaired.png';
import grasslandSouthcentralRoadRepaired from '../assets/map/grassland-southcentral-road-repaired.png';
import grasslandRiversideSmokeFree from '../assets/map/grassland-riverside-smoke-free.png';
import grasslandSouthRiversideSmokeFree from '../assets/map/grassland-south-riverside-smoke-free.png';
import chimneySmokeWisp from '../assets/map/chimney-smoke-wisp.png';
import windmillWithoutSails from '../assets/map/windmill-without-sails.png';
import windmillRotor from '../assets/map/windmill-rotor.png';
import { mapSizes, type MapLayout } from './layout';

export interface WorldArtProps {
  layout: MapLayout;
  className?: string;
}

const southDistrictStartX = 1506 + 1420 * 1566 / 1536;

// Keep the approved first seam; the riverside image repeats 116px of the windmill edge.
export function WorldArt({ layout, className }: WorldArtProps) {
  const { width, height } = mapSizes[layout];
  const artWidth = 1536;
  const overlap = 60;
  const riversideOverlap = 116;
  const eastStart = artWidth - overlap / 2;
  const paintedWidth = artWidth + overlap / 2;
  const imageScale = paintedWidth / artWidth;
  const riversideStart = southDistrictStartX;
  const riversideSeam = riversideStart + riversideOverlap * imageScale / 2;
  const southStart = 900;
  const southSeam = southStart + (height > 1024 ? 68 : 0);
  const seamCenters = [artWidth, riversideSeam];
  const seamPath = (center: number) => `M ${center + 5} -50 C ${center - 10} 180, ${center + 12} 300, ${center} 430 C ${center - 12} 570, ${center + 10} 700, ${center - 5} 850 C ${center - 10} 970, ${center + 10} 1050, ${center + 5} 1070 L ${center + 60} 1070 L ${center + 60} -50 Z`;
  const riversideChimney = { x: riversideStart + 1097 * imageScale, y: -10 + 122 * 1034 / 1024 };
  const southChimneys = [
    { x: riversideStart + 244 * imageScale, y: southStart + 273 },
    { x: riversideStart + 1167 * imageScale, y: southStart + 318 },
    { x: riversideStart + 352 * imageScale, y: southStart + 586 },
  ];
  const smokeChimneys = [
    { x: 2334, y: 254, width: 93, height: 120 },
    { ...riversideChimney, width: 69, height: 90 },
    ...southChimneys.map(({ x, y }) => ({ x, y, width: 76, height: 99 })),
  ];

  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <filter id="east-seam-soften" x="-30%" y="-10%" width="160%" height="120%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="south-seam-soften" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
        <filter id="windmill-repair-soften" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="smoke-repair-soften" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="southwest-road-soften" x="-15%" y="-30%" width="130%" height="160%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
        <mask id="southwest-road-repair" maskUnits="userSpaceOnUse" x="850" y="1360" width="716" height="390">
          <path d="M 900 1415 C 1080 1400, 1240 1465, 1390 1450 L 1566 1430 L 1566 1700 C 1370 1680, 1090 1740, 900 1680 C 850 1590, 850 1490, 900 1415 Z" fill="white" filter="url(#southwest-road-soften)" />
        </mask>
        <mask id="southcentral-road-repair" maskUnits="userSpaceOnUse" x="1506" y="1320" width="450" height="380">
          <path d="M 1506 1360 C 1630 1350, 1790 1380, 1910 1410 L 1910 1650 C 1780 1630, 1630 1660, 1506 1660 Z" fill="white" filter="url(#southwest-road-soften)" />
        </mask>
        <mask id="riverside-smoke-repair" maskUnits="userSpaceOnUse">
          <ellipse cx={riversideChimney.x} cy={riversideChimney.y - 31} rx="31" ry="43" fill="white" filter="url(#smoke-repair-soften)" />
        </mask>
        <mask id="south-smoke-repair" maskUnits="userSpaceOnUse">
          {southChimneys.map(({ x, y }) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y - 34} rx="34" ry="48" fill="white" filter="url(#smoke-repair-soften)" />
          ))}
        </mask>
        <mask id="south-fill-seam" x="0" y={southStart} width={width} height={height - southStart} maskUnits="userSpaceOnUse">
          <path d={`M 0 ${southSeam + 13} C 350 ${southSeam - 28}, 730 ${southSeam + 24}, 1040 ${southSeam - 8} S 1390 ${southSeam + 19}, 1536 ${southSeam - 5} S 1900 ${southSeam - 25}, 2220 ${southSeam + 12} S 2720 ${southSeam - 17}, 3000 ${southSeam + 14} S 3600 ${southSeam - 22}, ${width} ${southSeam + 5} L ${width} ${height} L 0 ${height} Z`} fill="white" filter="url(#south-seam-soften)" />
          <rect x="0" y={southSeam + 48} width={width} height={height - southSeam - 48} fill="white" />
        </mask>
        {[{ start: eastStart, end: paintedWidth }, { start: riversideStart, end: eastStart + paintedWidth }].map(({ start, end }, index) => (
          <g key={`south-blend-${index}`}>
            <linearGradient id={`south-blend-gradient-${index}`} gradientUnits="userSpaceOnUse" x1={start} x2={end} y1="0" y2="0">
              <stop offset="0" stopColor="black" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <mask id={`south-district-seam-${index}`} maskUnits="userSpaceOnUse" x={start} y={southStart} width={width - start} height={height - southStart}>
              <rect x={start} y={southStart} width={end - start} height={height - southStart} fill={`url(#south-blend-gradient-${index})`} />
              <rect x={end} y={southStart} width={width - end} height={height - southStart} fill="white" />
            </mask>
          </g>
        ))}
        <mask id="windmill-repair" x="2380" y="20" width="250" height="290" maskUnits="userSpaceOnUse">
          <g stroke="white" strokeWidth="54" strokeLinecap="round" filter="url(#windmill-repair-soften)">
            <path d="M 2522 166 L 2413 96" />
            <path d="M 2522 166 L 2562 64" />
            <path d="M 2522 166 L 2604 228" />
            <path d="M 2522 166 L 2495 268" />
          </g>
          <circle cx="2522" cy="166" r="34" fill="white" filter="url(#windmill-repair-soften)" />
        </mask>
        {seamCenters.map((center, index) => (
          <mask key={center} id={`district-seam-${index}`} x={index === 0 ? eastStart : riversideStart} y="0" width={paintedWidth} height={height} maskUnits="userSpaceOnUse">
            <path d={seamPath(center)} fill="white" filter="url(#east-seam-soften)" />
            <rect x={center + 25} y="0" width={width - center - 25} height={height} fill="white" />
          </mask>
        ))}
      </defs>
      <image
        href={grasslandWorldSection}
        x="0"
        y="0"
        width={paintedWidth}
        height={1024}
        preserveAspectRatio="none"
      />
      <image
        href={grasslandEastSection}
        x={eastStart}
        y="-10"
        width={paintedWidth}
        height={1034}
        preserveAspectRatio="none"
        mask="url(#district-seam-0)"
      />
      <image
        href={grasslandRiversideSection}
        x={riversideStart}
        y="-10"
        width={paintedWidth}
        height={1034}
        preserveAspectRatio="none"
        mask="url(#district-seam-1)"
      />
      <image
        href={grasslandRiversideSmokeFree}
        x={riversideStart}
        y="-10"
        width={paintedWidth}
        height={1034}
        preserveAspectRatio="none"
        mask="url(#riverside-smoke-repair)"
      />
      {height > 1024 && (
        <g mask="url(#south-fill-seam)">
          <image href={grasslandSouthwestSection} x="0" y={southStart} width={paintedWidth} height="1024" preserveAspectRatio="none" />
          <image href={grasslandSouthwestRoadRepaired} x="0" y={southStart} width={paintedWidth} height="1024" preserveAspectRatio="none" mask="url(#southwest-road-repair)" />
          <g mask="url(#south-district-seam-0)">
            <image href={grasslandSouthcentralSection} x={eastStart} y={southStart} width={paintedWidth} height="1024" preserveAspectRatio="none" />
            <image href={grasslandSouthcentralRoadRepaired} x={eastStart} y={southStart} width={paintedWidth} height="1024" preserveAspectRatio="none" mask="url(#southcentral-road-repair)" />
          </g>
          <image href={grasslandSouthRiversideSection} x={riversideStart} y={southStart} width={paintedWidth} height="1024" preserveAspectRatio="none" mask="url(#south-district-seam-1)" />
          <image href={grasslandSouthRiversideSmokeFree} x={riversideStart} y={southStart} width={paintedWidth} height="1024" preserveAspectRatio="none" mask="url(#south-smoke-repair)" />
        </g>
      )}
      <image
        href={windmillWithoutSails}
        x={eastStart}
        y="-10"
        width={paintedWidth}
        height={1034}
        preserveAspectRatio="none"
        mask="url(#windmill-repair)"
      />
      <image className="windmill-rotor" href={windmillRotor} x="2395" y="44" width="240" height="240" />
      {smokeChimneys.map(({ x, y, width: smokeWidth, height: smokeHeight }) => (
        <g key={`${x}-${y}`} className="chimney-smoke-preview">
          {[0, 1, 2].map((index) => (
            <image key={index} href={chimneySmokeWisp} x={x - smokeWidth * .4} y={y - smokeHeight} width={smokeWidth} height={smokeHeight} preserveAspectRatio="none" />
          ))}
        </g>
      ))}
    </svg>
  );
}
