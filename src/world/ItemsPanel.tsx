import { AvatarArt } from './AvatarArt';
import { ownedKeepsakes, wornEquipment } from './progress';
import type { WorldProgress } from './progress';
import { equipmentCount, keepsakeCount } from './story';
import type { Item } from './story';

interface ItemsPanelProps {
  progress: WorldProgress;
  onClose: () => void;
}

function ItemList<T extends Item>({ list, describe }: { list: T[]; describe: (item: T) => string }) {
  return (
    <ul className="item-list">
      {list.map((item) => (
        <li key={item.id}>
          <b>{item.name}</b>
          <small>{describe(item)}</small>
        </li>
      ))}
    </ul>
  );
}

export function ItemsPanel({ progress, onClose }: ItemsPanelProps) {
  const worn = wornEquipment(progress);
  const keepsakes = ownedKeepsakes(progress);

  return (
    <section className="world-dialog-card items-panel" aria-labelledby="items-title">
      <div className="items-panel-head">
        <h2 id="items-title">旅人と持ち物</h2>
        <button className="dialog-close" onClick={onClose} aria-label="持ち物パネルを閉じる">×</button>
      </div>
      <div className="items-panel-body">
        <div>
          <AvatarArt wornCount={worn.length} equipmentCount={equipmentCount} className="avatar-art" />
          <p className="avatar-note">装備を手に入れるたびに、旅人の姿が変わります（姿の絵は準備中です）。</p>
        </div>
        <div className="items-panel-lists">
          <h3>装備 {worn.length} / {equipmentCount}</h3>
          {worn.length === 0
            ? <p className="empty-copy">フェーズ1を修了すると、最初の装備が届きます。</p>
            : <ItemList list={worn} describe={(item) => item.equipment.appearance} />}
          <h3>持ち物 {keepsakes.length} / {keepsakeCount}</h3>
          {keepsakes.length === 0
            ? <p className="empty-copy">フェーズを修了すると、ここにアイテムが届きます。</p>
            : <ItemList list={keepsakes} describe={(item) => item.effect} />}
        </div>
      </div>
    </section>
  );
}
