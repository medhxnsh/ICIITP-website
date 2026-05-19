/**
 * WordPress-backed team members.
 */
import { wpFetch, acfStr } from "@/lib/wordpress";

export type TeamRole = "governance" | "evaluation" | "staff";

export interface WpTeamMember {
  id: string;
  name: string;
  designation: string;
  role: TeamRole;
  email?: string;
  linkedin?: string;
  photo?: string;
  bio?: string;
  displayOrder: number;
}

function toDoc(post: Awaited<ReturnType<typeof wpFetch>>[number]): WpTeamMember {
  const acf = post.acf;
  return {
    id:           String(post.id),
    name:         post.title.rendered,
    designation:  acfStr(acf, "designation"),
    role:         acfStr(acf, "role") as TeamRole,
    email:        acfStr(acf, "email") || undefined,
    linkedin:     acfStr(acf, "linkedin") || undefined,
    photo:        acfStr(acf, "photo") || undefined,
    bio:          acfStr(acf, "bio") || undefined,
    displayOrder: Number(acf["display_order"] ?? 0),
  };
}

export async function getAllWpTeam(): Promise<WpTeamMember[]> {
  const posts = await wpFetch("ic_team");
  return posts.map(toDoc).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getWpTeamByRole(role: TeamRole): Promise<WpTeamMember[]> {
  const all = await getAllWpTeam();
  return all.filter((m) => m.role === role);
}
