import InviteStaff from "@/components/dashboard/InviteStaff";

export default function EquipePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Équipe</h1>
        <p className="text-sm text-ink-soft">Invite les agents qui pourront consulter le registre.</p>
      </div>
      <InviteStaff />
    </div>
  );
}
