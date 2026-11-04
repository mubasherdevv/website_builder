"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  FormDefinition,
  FormSubmission,
} from "@/types/forms";
import {
  FormsManagerService,
  READY_MADE_FORM_TEMPLATES,
} from "@/lib/services/forms-manager.service";
import { FormBuilderOverlay } from "@/components/forms/FormBuilderOverlay";
import { SubmissionDetailsDrawer } from "@/components/forms/SubmissionDetailsDrawer";
import { toast } from "@/components/ui/Toast";
import {
  FileText,
  Inbox,
  LayoutTemplate,
  Settings,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Edit2,
  Copy,
  Trash2,
  Mail,
  ShieldAlert,
  Send,
  Calendar,
  DollarSign,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function FormsDashboardPage() {
  const params = useParams();
  const websiteId = (params?.websiteId as string) || "default";

  // Navigation State
  const [activeTab, setActiveTab] = useState<"forms" | "submissions" | "templates" | "settings">("forms");

  // Data State
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [formFilter, setFormFilter] = useState<string>("all");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>("all");

  // Modal / Overlay State
  const [editingForm, setEditingForm] = useState<FormDefinition | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<FormSubmission | null>(null);

  // Load Data
  const refreshData = useCallback(async () => {
    // 1. Immediate local cache load for instant UI response
    const loadedForms = FormsManagerService.getForms(websiteId);
    const loadedSubmissions = FormsManagerService.getSubmissions(websiteId);
    setForms(loadedForms);
    setSubmissions(loadedSubmissions);

    // 2. Fetch fresh live records from Supabase database
    try {
      const [dbForms, dbSubmissions] = await Promise.all([
        FormsManagerService.fetchFormsFromDb(websiteId),
        FormsManagerService.fetchSubmissionsFromDb(websiteId),
      ]);
      setForms(dbForms);
      setSubmissions(dbSubmissions);
    } catch (err) {
      console.warn("Error refreshing from database, falling back to cache:", err);
    }
  }, [websiteId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Overview Metrics
  const metrics = useMemo(() => {
    const totalForms = forms.length;
    const activeForms = forms.filter((f) => f.status === "active").length;
    const totalSubmissions = submissions.length;
    const newSubmissions = submissions.filter((s) => s.status === "new").length;
    return { totalForms, activeForms, totalSubmissions, newSubmissions };
  }, [forms, submissions]);

  // Filtered Forms
  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = formFilter === "all" || f.status === formFilter;
      return matchesSearch && matchesStatus;
    });
  }, [forms, searchQuery, formFilter]);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(s.data).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        submissionStatusFilter === "all" || s.status === submissionStatusFilter;
      const matchesForm = formFilter === "all" || s.formId === formFilter;
      return matchesSearch && matchesStatus && matchesForm;
    });
  }, [submissions, searchQuery, submissionStatusFilter, formFilter]);

  // Actions
  const handleCreateNewForm = () => {
    const blank = FormsManagerService.createFromTemplate(
      websiteId,
      "tpl_contact",
      "New Untitled Form"
    );
    setEditingForm(blank);
    refreshData();
    toast.info("Created new form draft.");
  };

  const handleUseTemplate = (templateId: string) => {
    const created = FormsManagerService.createFromTemplate(websiteId, templateId);
    setEditingForm(created);
    refreshData();
    toast.success(`Loaded template: "${created.name}"`);
  };

  const handleToggleStatus = (formId: string) => {
    const res = FormsManagerService.toggleFormStatus(websiteId, formId);
    refreshData();
    toast.success(`Form status updated to ${res?.status || "updated"}.`);
  };

  const handleDuplicateForm = (formId: string) => {
    const res = FormsManagerService.duplicateForm(websiteId, formId);
    refreshData();
    toast.success(`Duplicated form: "${res?.name || "Copy"}"`);
  };

  const handleDeleteForm = (formId: string) => {
    if (confirm("Are you sure you want to delete this form?")) {
      FormsManagerService.deleteForm(websiteId, formId);
      refreshData();
      toast.success("Form deleted successfully.");
    }
  };

  const handleSaveForm = async (updated: FormDefinition) => {
    await FormsManagerService.persistFormToDb(websiteId, updated);
    refreshData();
    toast.success("Form configuration saved successfully.");
  };

  const handleExportCsv = () => {
    const csv = FormsManagerService.exportSubmissionsCsv(
      websiteId,
      formFilter === "all" ? undefined : formFilter
    );
    if (!csv) {
      toast.warning("No submissions available to export.");
      return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `submissions_${websiteId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Submissions exported to CSV successfully.");
  };

  const templateIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Mail,
    DollarSign,
    Calendar,
    Send,
    MessageSquare,
  };

  return (
    <div className="min-h-screen bg-app-background text-text-primary p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Forms & Submissions
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Build responsive web forms, manage client leads, and protect against spam.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleCreateNewForm}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Forms</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-text-primary">{metrics.totalForms}</div>
          <p className="text-[11px] text-text-muted mt-1">Ready for public use</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Forms</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-2xl font-extrabold text-text-primary">{metrics.activeForms}</div>
          <p className="text-[11px] text-text-muted mt-1">Accepting submissions</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Leads</span>
            <Inbox className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-text-primary">{metrics.totalSubmissions}</div>
          <p className="text-[11px] text-text-muted mt-1">Across all forms</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">New Inquiries</span>
            <Clock className="w-4 h-4 text-status-info" />
          </div>
          <div className="text-2xl font-extrabold text-brand">{metrics.newSubmissions}</div>
          <p className="text-[11px] text-text-muted mt-1">Awaiting review</p>
        </div>
      </div>

      {/* Internal Navigation Tabs (Single Route) */}
      <div className="border-b border-border flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("forms")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "forms"
              ? "border-brand text-brand"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Forms ({forms.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "submissions"
              ? "border-brand text-brand"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Submissions Inbox ({submissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "templates"
              ? "border-brand text-brand"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Ready-Made Templates (5)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-brand text-brand"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Global Settings</span>
        </button>
      </div>

      {/* TAB 1: ALL FORMS */}
      {activeTab === "forms" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search forms by name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Form Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Fields</th>
                    <th className="py-3 px-4">Submissions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredForms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-text-muted">
                        No forms found. Create one or select a ready-made template.
                      </td>
                    </tr>
                  ) : (
                    filteredForms.map((form) => (
                      <tr key={form.id} className="hover:bg-surface-subtle/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-text-primary">
                          <button
                            type="button"
                            onClick={() => setEditingForm(form)}
                            className="hover:text-brand hover:underline text-left block truncate max-w-xs"
                          >
                            {form.name}
                          </button>
                          <span className="text-[10px] font-mono text-text-muted font-normal">
                            {form.id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-border bg-surface-subtle text-text-secondary">
                            {form.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-semibold">
                          {form.fields.length} fields
                        </td>
                        <td className="py-3 px-4 font-semibold text-text-primary">
                          <button
                            type="button"
                            onClick={() => {
                              setFormFilter(form.id);
                              setActiveTab("submissions");
                            }}
                            className="hover:text-brand hover:underline"
                          >
                            {form.submissionsCount} leads
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(form.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all ${
                              form.status === "active"
                                ? "bg-status-success-soft text-status-success border-status-success/30"
                                : "bg-surface-subtle text-text-muted border-border"
                            }`}
                          >
                            {form.status === "active" ? (
                              <ToggleRight className="w-3.5 h-3.5" />
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5" />
                            )}
                            <span className="capitalize">{form.status}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-text-muted text-[11px]">
                          {new Date(form.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingForm(form)}
                              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
                              title="Edit Form"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateForm(form.id)}
                              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
                              title="Duplicate Form"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteForm(form.id)}
                              className="p-1.5 rounded-md text-text-muted hover:text-status-danger hover:bg-status-danger-soft transition-colors"
                              title="Delete Form"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBMISSIONS INBOX */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by text or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="all">All Forms</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <select
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="all">All Statuses</option>
                <option value="new">New Only</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Form</th>
                    <th className="py-3 px-4">Key Submission Preview</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-text-muted">
                        No submissions recorded for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const firstValue = String(
                        sub.data?.fullName ||
                        sub.data?.name ||
                        sub.data?.clientName ||
                        sub.data?.customerName ||
                        sub.data?.email ||
                        "Submission Entry"
                      );
                      const summary = String(
                        sub.data?.message ||
                        sub.data?.projectDetails ||
                        sub.data?.notes ||
                        sub.data?.email ||
                        JSON.stringify(sub.data)
                      );

                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setViewingSubmission(sub)}
                          className="hover:bg-surface-subtle/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                sub.status === "new"
                                  ? "bg-status-info-soft text-status-info border-status-info/30"
                                  : sub.status === "replied"
                                  ? "bg-status-success-soft text-status-success border-status-success/30"
                                  : "bg-surface-subtle text-text-muted border-border"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-text-primary">
                            {sub.formName}
                          </td>
                          <td className="py-3 px-4 max-w-md truncate font-medium text-text-secondary">
                            <span className="font-bold text-text-primary mr-1">
                              {firstValue}:
                            </span>
                            <span className="text-text-muted">
                              {summary}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-text-muted text-[11px] whitespace-nowrap">
                            {new Date(sub.submittedAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-xs font-semibold text-brand hover:underline">
                              Inspect →
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {READY_MADE_FORM_TEMPLATES.map((tpl) => {
            const Icon = templateIcons[tpl.iconName] || FileText;

            return (
              <div
                key={tpl.id}
                className="bg-surface border border-border rounded-xl p-5 shadow-2xs hover:border-brand/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-brand">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-border bg-surface-subtle text-text-muted">
                      {tpl.category}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-text-primary">{tpl.name}</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border/60">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                      Included Fields ({tpl.fields.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.fields.map((fld) => (
                        <span
                          key={fld.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-subtle border border-border text-text-secondary"
                        >
                          {fld.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Production-ready</span>
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(tpl.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors shadow-2xs"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-surface border border-border rounded-xl p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-text-primary">
              Global Submission & Security Preferences
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Configure system-wide routing, notification emails, and bot mitigation policies.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-border bg-surface-subtle space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                <ShieldAlert className="w-4 h-4 text-brand" />
                <span>Anti-Spam & Rate Limiting</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Invisible Honeypot shield is activated across all forms by default. Automated scripts
                tripping hidden honeypot inputs are discarded with zero user friction.
              </p>
              <div className="text-[11px] font-semibold text-status-success flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero CAPTCHA requirement active</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Notification Recipient Email
              </label>
              <input
                type="email"
                defaultValue="admin@securesite.io"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
              />
              <span className="text-[10px] text-text-muted mt-1 block">
                Where instant email alerts are routed when a visitor completes a form.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Maximum File Upload Size
              </label>
              <select
                defaultValue="10"
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
              >
                <option value="5">5 Megabytes (MB)</option>
                <option value="10">10 Megabytes (MB)</option>
                <option value="25">25 Megabytes (MB)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* IN-ROUTE OVERLAYS & DRAWERS */}
      {editingForm && (
        <FormBuilderOverlay
          form={editingForm}
          isOpen={Boolean(editingForm)}
          onClose={() => {
            setEditingForm(null);
            refreshData();
          }}
          onSave={(updated) => {
            handleSaveForm(updated);
            setEditingForm(updated);
          }}
        />
      )}

      {viewingSubmission && (
        <SubmissionDetailsDrawer
          submission={viewingSubmission}
          isOpen={Boolean(viewingSubmission)}
          onClose={() => {
            setViewingSubmission(null);
            refreshData();
          }}
          onStatusChange={async (subId, status) => {
            const updated = FormsManagerService.updateSubmissionStatus(websiteId, subId, status);
            if (updated) setViewingSubmission(updated);
            try {
              await fetch(`/api/websites/${websiteId}/submissions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId: subId, status }),
              });
            } catch (e) {
              console.warn("Could not patch status to database:", e);
            }
            refreshData();
            toast.success(`Submission marked as "${status}".`);
          }}
          onAddNote={async (subId, note) => {
            const updated = FormsManagerService.addSubmissionNote(
              websiteId,
              subId,
              "Studio User",
              note
            );
            if (updated) setViewingSubmission(updated);
            try {
              await fetch(`/api/websites/${websiteId}/submissions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId: subId, note, author: "Studio User" }),
              });
            } catch (e) {
              console.warn("Could not push note to database:", e);
            }
            refreshData();
            toast.success("Internal note added.");
          }}
          onDelete={async (subId) => {
            if (confirm("Delete this submission record?")) {
              FormsManagerService.deleteSubmission(websiteId, subId);
              try {
                await fetch(`/api/websites/${websiteId}/submissions?id=${encodeURIComponent(subId)}`, {
                  method: "DELETE",
                });
              } catch (e) {
                console.warn("Could not delete submission from database:", e);
              }
              setViewingSubmission(null);
              refreshData();
              toast.success("Submission deleted.");
            }
          }}
        />
      )}
    </div>
  );
}
