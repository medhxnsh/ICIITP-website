"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Upload, X, Check } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import type { CmsStaffSection, CmsStaffMember } from "@/lib/cms/staff";
import {
  createSectionAction,
  renameSectionAction,
  deleteSectionAction,
  createMemberAction,
  updateMemberAction,
  deleteMemberAction,
} from "@/app/admin/(protected)/content/staff/actions";

interface Props {
  initial: CmsStaffSection[];
}

interface MemberForm {
  sectionId: string;
  name: string;
  designation: string;
  bio: string;
  photoUrl: string;
  email: string;
  linkedin: string;
  otherLinkUrl: string;
  otherLinkLabel: string;
  sortOrder: number;
}

const emptyMember = (sectionId: string): MemberForm => ({
  sectionId,
  name: "",
  designation: "",
  bio: "",
  photoUrl: "",
  email: "",
  linkedin: "",
  otherLinkUrl: "",
  otherLinkLabel: "",
  sortOrder: 0,
});

export function StaffManager({ initial }: Props) {
  const toast = useToast();
  const router = useRouter();
  const [sections, setSections] = useState<CmsStaffSection[]>(initial);

  useEffect(() => { setSections(initial); }, [initial]);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [savingSection, setSavingSection] = useState(false);

  // collapsed state per section
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // which section is being renamed
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  // member form state: null = closed, sectionId+memberId = edit, sectionId only = new
  const [memberForm, setMemberForm] = useState<{ memberId: string | null; form: MemberForm } | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  function reload() { router.refresh(); }

  // ── Section actions ──────────────────────────────────────────────────────────

  async function handleCreateSection() {
    if (!newSectionName.trim()) return;
    setSavingSection(true);
    try {
      const res = await createSectionAction(newSectionName.trim());
      if (res?.success) {
        setNewSectionName("");
        setAddingSection(false);
        reload();
        toast.success("Section created");
      } else {
        toast.error(res?.error ?? "Failed to create section");
      }
    } catch (e) {
      console.error("[StaffManager] handleCreateSection error:", e);
      toast.error("Failed to create section");
    } finally {
      setSavingSection(false);
    }
  }

  async function handleRenameSection() {
    if (!renaming) return;
    setSavingSection(true);
    try {
      const res = await renameSectionAction(renaming.id, renaming.name.trim());
      if (res?.success) {
        setRenaming(null);
        reload();
        toast.success("Section renamed");
      } else {
        toast.error(res?.error ?? "Failed to rename section");
      }
    } catch (e) {
      console.error("[StaffManager] handleRenameSection error:", e);
      toast.error("Failed to rename section");
    } finally {
      setSavingSection(false);
    }
  }

  async function handleDeleteSection(id: string, name: string) {
    if (!confirm(`Delete section "${name}" and all its members?`)) return;
    try {
      const res = await deleteSectionAction(id);
      if (res?.success) { reload(); toast.success("Section deleted"); }
      else { toast.error(res?.error ?? "Failed to delete section"); }
    } catch (e) {
      console.error("[StaffManager] handleDeleteSection error:", e);
      toast.error("Failed to delete section");
    }
  }

  // ── Member actions ───────────────────────────────────────────────────────────

  function openNewMember(sectionId: string) {
    setMemberForm({ memberId: null, form: emptyMember(sectionId) });
  }

  function openEditMember(member: CmsStaffMember) {
    setMemberForm({
      memberId: member.id,
      form: {
        sectionId: member.sectionId,
        name: member.name,
        designation: member.designation ?? "",
        bio: member.bio ?? "",
        photoUrl: member.photoUrl ?? "",
        email: member.email ?? "",
        linkedin: member.linkedin ?? "",
        otherLinkUrl: member.otherLinkUrl ?? "",
        otherLinkLabel: member.otherLinkLabel ?? "",
        sortOrder: member.sortOrder,
      },
    });
  }

  function setField(key: keyof MemberForm, value: string | number) {
    setMemberForm((prev) => prev ? { ...prev, form: { ...prev.form, [key]: value } } : prev);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url } = await res.json();
      if (url) setField("photoUrl", url);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  }

  async function handleSaveMember() {
    if (!memberForm) return;
    if (!memberForm.form.name.trim()) { toast.error("Name is required"); return; }
    setSavingMember(true);
    try {
      const payload = {
        sectionId: memberForm.form.sectionId,
        name: memberForm.form.name.trim(),
        designation: memberForm.form.designation || undefined,
        bio: memberForm.form.bio || undefined,
        photoUrl: memberForm.form.photoUrl || undefined,
        email: memberForm.form.email || undefined,
        linkedin: memberForm.form.linkedin || undefined,
        otherLinkUrl: memberForm.form.otherLinkUrl || undefined,
        otherLinkLabel: memberForm.form.otherLinkLabel || undefined,
        sortOrder: memberForm.form.sortOrder,
      };
      const res = memberForm.memberId
        ? await updateMemberAction(memberForm.memberId, payload)
        : await createMemberAction(payload);
      if (res?.success) {
        toast.success(memberForm.memberId ? "Member updated" : "Member added");
        setMemberForm(null);
        reload();
      } else {
        toast.error(res?.error ?? "Failed to save member");
      }
    } catch (e) {
      console.error("[StaffManager] handleSaveMember error:", e);
      toast.error("Failed to save member");
    } finally {
      setSavingMember(false);
    }
  }

  async function handleDeleteMember(id: string, name: string) {
    if (!confirm(`Remove "${name}" from staff?`)) return;
    try {
      const res = await deleteMemberAction(id);
      if (res?.success) {
        reload();
        toast.success("Member removed");
      } else {
        toast.error(res?.error ?? "Failed to remove member");
      }
    } catch (e) {
      console.error("[StaffManager] handleDeleteMember error:", e);
      toast.error("Failed to remove member");
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Staff</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          {sections.reduce((n, s) => n + s.members.length, 0)} members
        </span>
        <button
          type="button"
          onClick={() => setAddingSection(true)}
          className="ml-auto flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          <Plus className="w-4 h-4" /> New Section
        </button>
      </div>

      {/* New section inline form */}
      {addingSection && (
        <div className="mb-4 p-4 rounded-2xl flex items-center gap-3" style={{ border: "1.5px dashed #d4e6c4", backgroundColor: "#f8fdf4" }}>
          <input
            autoFocus
            type="text"
            placeholder="Section name (e.g. Leadership)"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateSection(); if (e.key === "Escape") { setAddingSection(false); setNewSectionName(""); } }}
            className="flex-1 text-sm px-3 py-2 rounded-lg outline-none"
            style={{ border: "1px solid var(--color-input-border)", backgroundColor: "white" }}
          />
          <button
            type="button"
            onClick={handleCreateSection}
            disabled={savingSection || !newSectionName.trim()}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            {savingSection ? "Creating…" : "Create"}
          </button>
          <button type="button" onClick={() => { setAddingSection(false); setNewSectionName(""); }}
            className="p-2 rounded-lg" style={{ color: "var(--color-text-secondary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {sections.length === 0 && !addingSection && (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed #d4e6c4" }}>
          <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-input-border)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>No sections yet.</p>
          <p className="text-xs mb-4" style={{ color: "var(--color-placeholder)" }}>Create a section first, then add members to it.</p>
          <button type="button" onClick={() => setAddingSection(true)}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: "var(--color-brand-800)" }}>
            <Plus className="w-4 h-4 inline mr-1.5 -mt-0.5" />New Section
          </button>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isCollapsed = collapsed[section.id];
          const isRenaming = renaming?.id === section.id;

          return (
            <div key={section.id} className="rounded-2xl overflow-hidden bg-white" style={{ border: "1px solid #e8f0e0" }}>
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-3.5" style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #e8f0e0" }}>
                {isRenaming ? (
                  <input
                    autoFocus
                    type="text"
                    value={renaming.name}
                    onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRenameSection(); if (e.key === "Escape") setRenaming(null); }}
                    className="flex-1 text-sm font-bold px-2 py-1 rounded outline-none"
                    style={{ border: "1px solid var(--color-input-border)" }}
                  />
                ) : (
                  <h2 className="flex-1 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-brand-950)" }}>
                    {section.name}
                    <span className="ml-2 text-xs font-semibold normal-case" style={{ color: "var(--color-text-secondary)" }}>
                      {section.members.length} {section.members.length === 1 ? "member" : "members"}
                    </span>
                  </h2>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {isRenaming ? (
                    <>
                      <button type="button" onClick={handleRenameSection} disabled={savingSection}
                        className="p-1.5 rounded-lg" style={{ color: "var(--color-brand-800)" }} title="Save">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setRenaming(null)}
                        className="p-1.5 rounded-lg" style={{ color: "var(--color-text-secondary)" }} title="Cancel">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => openNewMember(section.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                        <Plus className="w-3 h-3" /> Add Member
                      </button>
                      <button type="button" onClick={() => setRenaming({ id: section.id, name: section.name })}
                        className="p-1.5 rounded-lg hover:bg-white transition-colors" title="Rename"
                        style={{ color: "var(--color-text-secondary)" }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDeleteSection(section.id, section.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete section"
                        style={{ color: "#ef4444" }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))}
                        className="p-1.5 rounded-lg" style={{ color: "var(--color-text-secondary)" }}>
                        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Members table */}
              {!isCollapsed && (
                <>
                  {section.members.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      No members yet.{" "}
                      <button type="button" onClick={() => openNewMember(section.id)}
                        className="font-semibold" style={{ color: "var(--color-brand-800)" }}>
                        Add one
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <colgroup>
                        <col style={{ width: "36%" }} />
                        <col style={{ width: "36%" }} />
                        <col style={{ width: "28%" }} />
                      </colgroup>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e8f0e0" }}>
                          <th className="text-left px-5 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Name</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Designation</th>
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "#f0f5e8" }}>
                        {section.members.map((member) => (
                          <tr key={member.id}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                {member.photoUrl ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: "1px solid var(--color-input-border)" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                                    style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                                    {member.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                                  </div>
                                )}
                                <span className="font-medium" style={{ color: "var(--color-brand-950)" }}>{member.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                              {member.designation ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 justify-end">
                                <button type="button" onClick={() => openEditMember(member)}
                                  className="text-xs font-medium px-3 py-1.5 rounded-lg"
                                  style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                                  Edit
                                </button>
                                <button type="button" onClick={() => handleDeleteMember(member.id, member.name)}
                                  className="text-xs font-medium px-3 py-1.5 rounded-lg"
                                  style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}>
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Member form modal */}
      {memberForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMemberForm(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]"
              style={{ border: "1px solid #e8f0e0" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e8f0e0" }}>
                <h2 className="font-black text-lg" style={{ color: "var(--color-brand-950)" }}>
                  {memberForm.memberId ? "Edit Member" : "Add Member"}
                </h2>
                <button type="button" onClick={() => setMemberForm(null)}
                  className="p-2 rounded-lg" style={{ color: "var(--color-text-secondary)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Photo */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Photo
                  </label>
                  <div className="flex items-center gap-3">
                    {memberForm.form.photoUrl ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: "2px solid var(--color-input-border)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={memberForm.form.photoUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center text-lg font-bold"
                        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                        {memberForm.form.name ? memberForm.form.name.split(" ").map((w) => w[0]).slice(0, 2).join("") : "?"}
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => photoInput.current?.click()}
                        disabled={photoUploading}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                        <Upload className="w-3 h-3" />
                        {photoUploading ? "Uploading…" : "Upload Photo"}
                      </button>
                      {memberForm.form.photoUrl && (
                        <button type="button" onClick={() => setField("photoUrl", "")}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}>
                          Remove
                        </button>
                      )}
                    </div>
                    <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="text" value={memberForm.form.name} onChange={(e) => setField("name", e.target.value)}
                    placeholder="Full name"
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1px solid var(--color-input-border)" }} />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Designation
                  </label>
                  <input type="text" value={memberForm.form.designation} onChange={(e) => setField("designation", e.target.value)}
                    placeholder="e.g. Senior Executive – IT Operations"
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1px solid var(--color-input-border)" }} />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Bio
                  </label>
                  <textarea rows={3} value={memberForm.form.bio} onChange={(e) => setField("bio", e.target.value)}
                    placeholder="Short biography (shown in popup)"
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none"
                    style={{ border: "1px solid var(--color-input-border)" }} />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Email
                  </label>
                  <input type="email" value={memberForm.form.email} onChange={(e) => setField("email", e.target.value)}
                    placeholder="e.g. name@iitp.ac.in"
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1px solid var(--color-input-border)" }} />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    LinkedIn URL
                  </label>
                  <input type="url" value={memberForm.form.linkedin} onChange={(e) => setField("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1px solid var(--color-input-border)" }} />
                </div>

                {/* Other link */}
                <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid #e8f0e0" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Other Link <span className="font-normal normal-case tracking-normal" style={{ color: "var(--color-placeholder)" }}>(optional — e.g. Google Scholar, personal site)</span>
                  </p>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>Link Label</label>
                    <input type="text" value={memberForm.form.otherLinkLabel} onChange={(e) => setField("otherLinkLabel", e.target.value)}
                      placeholder="e.g. Google Scholar, ResearchGate, Website"
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                      style={{ border: "1px solid var(--color-input-border)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>Link URL</label>
                    <input type="url" value={memberForm.form.otherLinkUrl} onChange={(e) => setField("otherLinkUrl", e.target.value)}
                      placeholder="https://…"
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                      style={{ border: "1px solid var(--color-input-border)" }} />
                  </div>
                </div>

                {/* Sort order */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                    Sort Order
                  </label>
                  <input type="number" value={memberForm.form.sortOrder}
                    onChange={(e) => setField("sortOrder", parseInt(e.target.value) || 0)}
                    className="w-24 text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1px solid var(--color-input-border)" }} />
                  <p className="text-xs mt-1" style={{ color: "var(--color-placeholder)" }}>Lower numbers appear first within the section.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-4 border-t" style={{ borderColor: "#e8f0e0" }}>
                <button type="button" onClick={handleSaveMember} disabled={savingMember}
                  className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-brand-800)" }}>
                  {savingMember ? "Saving…" : memberForm.memberId ? "Save Changes" : "Add Member"}
                </button>
                <button type="button" onClick={() => setMemberForm(null)}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl"
                  style={{ backgroundColor: "var(--color-surface-card)", color: "var(--color-text-secondary)" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
