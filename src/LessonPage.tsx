import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { stages } from './stages';
import completeSound from './assets/complete.mp3';
import completeVideo from './assets/complete-video.mp4';
import celebrationImage from './assets/characters/celebration.png';
import certificateImage from './assets/certificate.png';
import { AUDIO_VOLUME } from './audioSettings';
// 変更点1: 新しいコンポーネントをインポート
import MapComponent from './components/MapComponent';

// 教材ファイルの読み込み
import CarminaLesson from './lessons/Carmina';
import NorneLesson from './lessons/Norne';

const lessonComponents: Record<string, React.FC> = {
  カルミナ: CarminaLesson,
  ノルネ: NorneLesson,
};

interface Props {
  currentStage: number;
  setCurrentStage: React.Dispatch<React.SetStateAction<number>>;
}

function LessonPage({ currentStage, setCurrentStage }: Props) {
  const { name } = useParams();
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBattleField, setShowBattleField] = useState(false);

  if (!name) return <p>ステージが見つかりません。</p>;

  const isCurrent = name === stages[currentStage].name;
  const currentIndex = stages.findIndex(stage => stage.name === name);
  const isCompleted = currentIndex < currentStage;

  const handleComplete = () => {
    if (isCurrent) {
      const audio = new Audio(completeSound);
      audio.volume = AUDIO_VOLUME;
      audio.play();

      setShowCelebration(true);
      setCurrentStage(prev => prev + 1);
    } else {
      alert('このステージはまだ進めません。');
    }
  };

  const handleContinue = () => {
    setShowCelebration(false);
    setShowVideo(true);
  };

  // バトルフィールドから戻る処理
  const handleReturnFromField = () => {
    setShowBattleField(false);
  };

  const LessonContent = lessonComponents[name] || (() => <p>教材が見つかりません。</p>);

  // バトルフィールド表示中の場合
  // 変更点2: Map コンポーネントを MapComponent に変更
  if (showBattleField) {
    return <MapComponent onReturn={handleReturnFromField} />;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
      <h1>{name} の教材ページ</h1>
      <LessonContent />

      {showCelebration && (
        <div className="celebration-overlay">
          {name === 'カルミナ' ? (
            <>
              <div className="celebration-content">
                <div className="certificate-container">
                  <img 
                    src={certificateImage} 
                    alt="Certificate" 
                    className="certificate-image"
                  />
                </div>
                <div className="character-container">
                  <div className="speech-bubble">
                    <div className="speaker-name">カルミナの村長</div>
                    <p className="speech-text">
                      勇気の象徴、賢者の剣を手にしました！<br/>
                      素晴らしい進歩ですね！<br/>
                      あなたの成長を見守っていますよ。
                    </p>
                  </div>
                  <img 
                    src={celebrationImage} 
                    alt="Celebration" 
                    className="celebration-character"
                  />
                </div>
                <div className="continue-button-container">
                  <button 
                    className="continue-button"
                    onClick={handleContinue}
                  >
                    次へ進む ▶️
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="celebration-content">
                <div className="character-container">
                  <div className="speech-bubble">
                    <p className="speech-text">
                      素晴らしい進歩ですね！<br/>
                      次のステージに進みましょう！
                    </p>
                  </div>
                  <img 
                    src={celebrationImage} 
                    alt="Celebration" 
                    className="celebration-character"
                  />
                </div>
                <div className="continue-button-container">
                  <button 
                    className="continue-button"
                    onClick={handleContinue}
                  >
                    次へ進む ▶️
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showVideo ? (
        <div className="video-fullscreen">
          <video
            src={completeVideo}
            autoPlay
            controls={false}
            onEnded={() => navigate('/')}
            style={{ 
              width: '100vw', 
              height: '100vh', 
              objectFit: 'cover', 
              position: 'fixed',
              top: 0, 
              left: 0, 
              zIndex: 1000 
            }}
          />
          <button 
            className="rpg-skip-button"
            onClick={() => navigate('/')}
          >
            <span style={{ fontSize: '1.2em' }}>⏭</span>
            <span>スキップしてMapへ</span>
          </button>
        </div>
      ) : (
        <div className="button-group">
          {isCurrent && (
            <>
              <button className="read-button" onClick={handleComplete}>
                📘 読了する
              </button>
              <button className="field-button" onClick={() => setShowBattleField(true)}>
                ⚔️ フィールドへ出る
              </button>
              <button className="map-back-button" onClick={() => navigate('/')}>
                🗺 Mapに戻る
              </button>
            </>
          )}

          {isCompleted && (
            <>
              <button className="complete-button" disabled>
                <span className="crown-icon">👑</span>
                Completed!
              </button>
              <button className="map-back-button" onClick={() => navigate('/')}>
                🗺 Mapに戻る
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default LessonPage;