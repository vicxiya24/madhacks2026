import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ExcavationSessionView } from "@/components/excavation/excavation-session";
import { getMemory, getSession } from "@/lib/memory/queries";

export const metadata: Metadata = { title: "Excavation" };

type Props = { params: Promise<{ id: string; sessionId: string }> };

export default async function ExcavationPage({ params }: Props) {
  await connection(); // always render per request: the timer depends on "now"
  const { id, sessionId } = await params;
  const [memory, session] = await Promise.all([getMemory(id), getSession(sessionId)]);

  if (!memory || !session || session.memory_id !== memory.id) notFound();
  if (session.status !== "active") redirect(`/dig/${memory.id}`);

  return (
    <div className="grid gap-6">
      <div>
        <Link href={`/dig/${memory.id}`} className="text-muted-foreground hover:text-foreground text-sm">
          &larr; {memory.title}
        </Link>
        <h1 className="mt-2 font-serif text-3xl">Excavating: {memory.title}</h1>
      </div>
      <ExcavationSessionView memory={memory} session={session} serverNow={Date.now()} />
    </div>
  );
}
