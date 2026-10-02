import type { CharacterStage } from './characterStages';

export interface AvatarArtProps {
  stage: CharacterStage;
  className?: string;
}

export function AvatarArt({ stage, className }: AvatarArtProps) {
  return (
    <figure className={className}>
      <img src={stage.imageSource} alt={stage.name} width={1024} height={1536} />
    </figure>
  );
}
