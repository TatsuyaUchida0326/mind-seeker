import ruralDepartureImage from '../assets/characters/traveler/human-rural-departure.png';
import ruralStartImage from '../assets/characters/traveler/human-rural-start-v2.png';
import ruralTravelerImage from '../assets/characters/traveler/human-rural-traveler.png';
import newSalarymanImage from '../assets/characters/traveler/human-new-salaryman.png';
import workshopSupervisorImage from '../assets/characters/traveler/human-workshop-supervisor.png';
import workshopWorkerImage from '../assets/characters/traveler/human-workshop-worker.png';
import beigeJacketImage from '../assets/characters/sage/human-beige-jacket-holding-compass-v3.png';
import sageFinalImage from '../assets/characters/sage/human-sage-final-v4.png';
import sageWithoutBookImage from '../assets/characters/sage/human-sage-without-book-v4.png';

export interface CharacterStage {
  id: string;
  minimumCompletedPhases: number;
  name: string;
  description: string;
  imageSource: string;
}

export const characterStages: CharacterStage[] = [
  { id: 'rural-start', minimumCompletedPhases: 0, name: '田舎町の旅立ち前', description: '西洋の田舎町で、まだ自信を探している旅人。', imageSource: ruralStartImage },
  { id: 'rural-departure', minimumCompletedPhases: 1, name: '羅針盤を得た旅人', description: '最初の羅針盤を手に、旅へ踏み出した姿。', imageSource: ruralDepartureImage },
  { id: 'rural-traveler', minimumCompletedPhases: 4, name: '道を知る旅人', description: '旅の装いを整え、次の土地へ向かう姿。', imageSource: ruralTravelerImage },
  { id: 'workshop-worker', minimumCompletedPhases: 10, name: '工房の作業者', description: '街の仕事に向き合い、手を動かして学ぶ姿。', imageSource: workshopWorkerImage },
  { id: 'workshop-supervisor', minimumCompletedPhases: 14, name: '工房の監督者', description: '仲間を見渡し、現場を整える姿。', imageSource: workshopSupervisorImage },
  { id: 'new-salaryman', minimumCompletedPhases: 18, name: '新人会社員', description: '都会の入口で、仕事の基礎を身につけた姿。', imageSource: newSalarymanImage },
  { id: 'beige-jacket', minimumCompletedPhases: 20, name: '都会を歩く探究者', description: '羅針盤を手に、自分の進む道を選ぶ姿。', imageSource: beigeJacketImage },
  { id: 'sage-without-book', minimumCompletedPhases: 24, name: '書を探す賢者', description: '整えた装いで、学びを深める姿。', imageSource: sageWithoutBookImage },
  { id: 'sage-final', minimumCompletedPhases: 30, name: '悟りの書を開く賢者', description: '学びを自分の言葉に変え、光を分かち合う完成形。', imageSource: sageFinalImage },
];

export function characterStageForCompletedPhases(completedPhaseCount: number): CharacterStage {
  return characterStages.reduce((currentStage, stage) => (
    stage.minimumCompletedPhases <= completedPhaseCount ? stage : currentStage
  ), characterStages[0]);
}

export function characterPromotionForCompletion(completedPhaseCount: number): { before: CharacterStage; after: CharacterStage } | null {
  const before = characterStageForCompletedPhases(completedPhaseCount - 1);
  const after = characterStageForCompletedPhases(completedPhaseCount);
  return before.id === after.id ? null : { before, after };
}
