import { createClient } from "@/lib/supabase/server";
import { NoteInput } from "@/components/notes/note-input";
import { NoteCard } from "@/components/notes/note-card";

export async function ClientNotesSection({
  clientId,
  orgId,
  canEdit,
  canDelete,
}: {
  clientId: string;
  orgId: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("client_id", clientId)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium font-serif text-[#5f5f5f] uppercase tracking-wide mb-3">
        Notes
        {notes && notes.length > 0 ? (
          <span className="ml-2 text-[#9e9c9c]">({notes.length})</span>
        ) : null}
      </h2>

      {canEdit && <NoteInput clientId={clientId} />}

      <div className="mt-4 space-y-2">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              clientId={clientId}
              content={note.content}
              createdAt={note.created_at}
              followUpDate={note.follow_up_date}
              followUpStatus={note.follow_up_status}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))
        ) : (
          <p className="text-sm font-body text-[#9e9c9c] py-4 text-center">
            No notes yet. Add your first note above.
          </p>
        )}
      </div>
    </section>
  );
}

export function ClientNotesSkeleton() {
  return (
    <section className="mt-8 animate-pulse">
      <div className="h-4 w-16 bg-[#b2b2b1]/15 mb-3" />
      <div className="h-20 bg-[#f0eded]" />
      <div className="mt-4 space-y-2">
        <div className="h-16 bg-[#f0eded]" />
        <div className="h-16 bg-[#f0eded]" />
      </div>
    </section>
  );
}
