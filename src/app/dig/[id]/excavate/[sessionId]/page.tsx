import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { PageContainer } from "@/components/page-container";
import { ClueCard } from "@/components/memory/clue-card";
import { ExcavationSessionView } from "@/components/excavation/excavation-session";
import { getMemory, getSession } from "@/lib/memory/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Diving" };

type Props = { params: Promise<{ id: string; sessionId: string }> };

export default async function DivePage({ params }: Props) {
  await connection();
  const { id, sessionId } = await params;
  const [memory, session] = await Promise.all([getMemory(id), getSession(sessionId)]);

  if (!memory || !session || session.memory_id !== memory.id) notFound();
  if (session.status !== "active") redirect(`/dig/${memory.id}`);

  const when = formatDate(memory.occurred_on) ?? memory.era_label ?? "sometime";

  return (
    <PageContainer narrow className="grid gap-6">
      <div>
        <Link href={`/dig/${memory.id}`} className="text-muted-foreground hover:text-foreground text-sm">
          &larr; surface
        </Link>
        <p className="text-muted-foreground mt-4 font-mono text-xs">{when}</p>
        <h1 className="font-hand text-5xl leading-none font-bold">{memory.title}</h1>
      </div>

      {/* Only the clue. The earlier entry stays buried until after you've written. */}
      <ClueCard clue={memory.context_cue} />

      <ExcavationSessionView
        memoryId={memory.id}
        sessionId={session.id}
        nudge={session.prediction_error_prompt}
      />
    </PageContainer>
  );
}
