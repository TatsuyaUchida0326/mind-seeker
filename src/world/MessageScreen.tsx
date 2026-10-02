interface MessageScreenProps {
  title: string;
  messages: string[];
  actionLabel: string;
  onAction: () => void;
}

// 学習画面を開けないときなどに出す、暗い背景の1画面だけの案内
export function MessageScreen({ title, messages, actionLabel, onAction }: MessageScreenProps) {
  return (
    <main className="world-lesson message-screen">
      <h1>{title}</h1>
      {messages.map((message) => <p key={message}>{message}</p>)}
      <button onClick={onAction}>{actionLabel}</button>
    </main>
  );
}
