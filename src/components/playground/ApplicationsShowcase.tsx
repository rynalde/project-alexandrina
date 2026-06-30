import { Languages, FileText, MessageSquare, Bot } from "lucide-react";
import { type ComponentType } from "react";

interface App {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  example: string;
  desc: string;
}

const APPS: App[] = [
  {
    icon: Languages,
    title: "Tradução Automática",
    example: '"the cat sat" → "o gato sentou"',
    desc: "Mapeamento entre línguas. A aplicação original que motivou Seq2Seq em 2014.",
  },
  {
    icon: FileText,
    title: "Sumarização",
    example: "artigo de 3000 palavras → resumo de 50",
    desc: "Comprime conteúdo preservando informação essencial. Mesmo encoder-decoder, só muda o objetivo.",
  },
  {
    icon: MessageSquare,
    title: "Diálogo (Chatbots)",
    example: '"como você está?" → "estou bem, obrigado"',
    desc: "Cada turno é uma sequência; a resposta é outra. Encoder vê histórico, decoder gera resposta.",
  },
  {
    icon: Bot,
    title: "Code Generation",
    example: '"sort a list in python" → "sorted(my_list)"',
    desc: "Linguagem natural → código. Treina-se em pares (descrição, código).",
  },
];

export default function ApplicationsShowcase() {
  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {APPS.map((app, i) => {
        const Icon = app.icon;
        return (
          <div
            key={i}
            className="bg-card border border-border rounded-sm p-4 animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-background rounded-sm p-2 border border-border shrink-0">
                <Icon size={18} className="text-rubric" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif italic text-base sm:text-lg text-ink mb-1">
                  {app.title}
                </div>
                <div className="font-mono text-[10px] sm:text-[11px] text-rubric mb-2 break-words">
                  {app.example}
                </div>
                <p className="font-sans text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed">
                  {app.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
