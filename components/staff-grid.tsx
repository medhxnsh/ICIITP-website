import type { TeamMember } from "@/lib/content";

const ROLE_ORDER = ["Leadership", "Management", "Incubation", "Programs", "Technical", "Operations", "Administration"];

interface StaffGridProps {
  members: TeamMember[];
}

export function StaffGrid({ members }: StaffGridProps) {
  const groups = members.reduce<Record<string, TeamMember[]>>((acc, m) => {
    (acc[m.role] ??= []).push(m);
    return acc;
  }, {});

  const orderedRoles = [
    ...ROLE_ORDER.filter((r) => groups[r]),
    ...Object.keys(groups).filter((r) => !ROLE_ORDER.includes(r)),
  ];

  return (
    <div className="space-y-12">
      {orderedRoles.map((role) => (
        <section key={role}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
              {role}
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border-subtle)" }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {groups[role].map((member, i) => (
              <StaffCard key={`${member.name}-${i}`} member={member} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function StaffCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex flex-col items-center text-center group">
      <div
        className="w-24 h-24 rounded-2xl overflow-hidden mb-3 border-2 transition-all group-hover:shadow-md"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.photo ?? "/logo.png"}
          alt={member.name}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-brand-950)" }}>
        {member.name}
      </p>
      <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--color-text-secondary)" }}>
        {member.designation}
      </p>
      {(member.email || member.linkedin) && (
        <div className="flex gap-2 mt-2">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              aria-label={`Email ${member.name}`}
              className="transition-opacity hover:opacity-70"
              style={{ color: "var(--color-brand-800)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="transition-opacity hover:opacity-70"
              style={{ color: "var(--color-brand-800)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          )}
        </div>
      )}
    </article>
  );
}
