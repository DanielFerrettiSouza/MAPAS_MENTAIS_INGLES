// Parede 3D de mini-mapas rolando sem parar (exemplos de temas possíveis).
const CARDS = [
  { emoji: "✈️", title: "No aeroporto", level: "A2", color: "#2563eb", lines: ["Where is gate 12?", "I'd like a window seat.", "My flight is delayed."] },
  { emoji: "🍔", title: "No restaurante", level: "A1", color: "#ea580c", lines: ["Can I see the menu?", "I'll have the burger.", "Check, please!"] },
  { emoji: "💼", title: "Entrevista de emprego", level: "B1", color: "#7c3aed", lines: ["Tell me about yourself.", "My biggest strength is…", "I'm a team player."] },
  { emoji: "🎬", title: "Gírias de séries", level: "B2", color: "#e11d48", lines: ["That's lit!", "I'm down.", "No cap."] },
  { emoji: "🏨", title: "No hotel", level: "A2", color: "#0891b2", lines: ["I have a reservation.", "What time is checkout?", "The AC isn't working."] },
  { emoji: "🧩", title: "Phrasal verbs", level: "B1", color: "#16a34a", lines: ["Give up", "Figure out", "Look forward to"] },
  { emoji: "🛒", title: "No supermercado", level: "A1", color: "#ca8a04", lines: ["Where's the milk?", "Paper or plastic?", "How much is this?"] },
  { emoji: "🗣️", title: "Small talk", level: "A2", color: "#db2777", lines: ["How's it going?", "Nice weather today!", "What do you do?"] },
  { emoji: "📞", title: "Reuniões online", level: "B1", color: "#4f46e5", lines: ["Can you hear me?", "You're on mute.", "Let's wrap up."] },
  { emoji: "🏥", title: "No médico", level: "A2", color: "#059669", lines: ["I have a headache.", "It hurts here.", "Do I need a prescription?"] },
  { emoji: "🎵", title: "Inglês com música", level: "B1", color: "#9333ea", lines: ["I've been waiting…", "Hold on", "Let it go"] },
  { emoji: "🚕", title: "Pegando um táxi", level: "A1", color: "#f59e0b", lines: ["Take me downtown.", "How long will it take?", "Keep the change."] },
];

function Card({ c }: { c: (typeof CARDS)[number] }) {
  return (
    <div className="wall-card" style={{ borderColor: c.color }}>
      <div className="wall-head">
        <span className="wall-emoji" style={{ background: c.color }}>{c.emoji}</span>
        <div>
          <strong>{c.title}</strong>
          <small>Nível {c.level}</small>
        </div>
      </div>
      <ul>
        {c.lines.map((l) => (
          <li key={l}><span style={{ color: c.color }}>▶</span> {l}</li>
        ))}
      </ul>
    </div>
  );
}

export default function MapWall() {
  const cols = [0, 1, 2, 3].map((i) => CARDS.filter((_, k) => k % 4 === i));
  return (
    <div className="wall" aria-hidden>
      <div className="wall-plane">
        {cols.map((col, i) => (
          <div key={i} className={`wall-col ${i % 2 ? "down" : "up"}`}>
            {[...col, ...col].map((c, k) => (
              <Card key={k} c={c} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
