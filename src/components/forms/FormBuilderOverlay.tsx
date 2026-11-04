"use client";

import React, { useState } from "react";
import {
  FormDefinition,
  FormField,
  FormFieldType,
  FieldWidth,
  FormSettings,
} from "@/types/forms";
import {
  X,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  Type,
  Mail,
  Phone,
  AlignLeft,
  List,
  CheckSquare,
  Radio,
  Calendar,
  Upload,
  Hash,
  EyeOff,
  Check,
} from "lucide-react";

interface FormBuilderOverlayProps {
  form: FormDefinition;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedForm: FormDefinition) => void;
}

const FIELD_PALETTE: {
  type: FormFieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { type: "text", label: "Text Input", icon: Type, description: "Single-line plain text" },
  { type: "email", label: "Email Address", icon: Mail, description: "Email format validation" },
  { type: "phone", label: "Phone Number", icon: Phone, description: "Telephone number" },
  { type: "textarea", label: "Text Area", icon: AlignLeft, description: "Multi-line longer text" },
  { type: "select", label: "Dropdown Select", icon: List, description: "Select from options" },
  { type: "radio", label: "Radio Buttons", icon: Radio, description: "Single choice from list" },
  { type: "checkbox", label: "Checkboxes", icon: CheckSquare, description: "Multi-choice or consent" },
  { type: "date", label: "Date Picker", icon: Calendar, description: "Calendar date selector" },
  { type: "file", label: "File Upload", icon: Upload, description: "Attachment or resume" },
  { type: "number", label: "Number Input", icon: Hash, description: "Numeric values and counts" },
  { type: "hidden", label: "Hidden Field", icon: EyeOff, description: "Pass campaign tracking ID" },
];

export const FormBuilderOverlay: React.FC<FormBuilderOverlayProps> = ({
  form,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formName, setFormName] = useState(form.name);
  const [fields, setFields] = useState<FormField[]>(JSON.parse(JSON.stringify(form.fields)));
  const [settings, setSettings] = useState<FormSettings>(
    JSON.parse(JSON.stringify(form.settings))
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    fields[0]?.id || null
  );
  const [rightTab, setRightTab] = useState<"field" | "design" | "notifications">("field");
  const [previewMode, setPreviewMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const handleAddField = (type: FormFieldType) => {
    const newId = `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newName = `field_${fields.length + 1}`;
    const newField: FormField = {
      id: newId,
      type,
      name: newName,
      label: type.charAt(0).toUpperCase() + type.slice(1) + " Label",
      placeholder: `Enter ${type}...`,
      required: false,
      width: "full",
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? [
              { label: "Option 1", value: "option_1" },
              { label: "Option 2", value: "option_2" },
            ]
          : undefined,
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newId);
    setRightTab("field");
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  const handleDeleteField = (fieldId: string) => {
    const nextFields = fields.filter((f) => f.id !== fieldId);
    setFields(nextFields);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(nextFields[0]?.id || null);
    }
  };

  const handleDuplicateField = (fieldId: string) => {
    const target = fields.find((f) => f.id === fieldId);
    if (!target) return;
    const duplicated: FormField = {
      ...JSON.parse(JSON.stringify(target)),
      id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${target.name}_copy`,
      label: `${target.label} (Copy)`,
    };
    const targetIndex = fields.findIndex((f) => f.id === fieldId);
    const newFields = [...fields];
    newFields.splice(targetIndex + 1, 0, duplicated);
    setFields(newFields);
    setSelectedFieldId(duplicated.id);
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const newFields = [...fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);
    setFields(newFields);
  };

  const handleSaveForm = () => {
    const updated: FormDefinition = {
      ...form,
      name: formName.trim() || "Untitled Form",
      fields,
      settings,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-app-background flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Builder Navigation */}
      <header className="h-14 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
            title="Close Form Builder"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-text-muted hidden md:inline">Form:</span>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="text-sm font-bold text-text-primary bg-transparent hover:bg-surface-subtle focus:bg-surface border border-transparent hover:border-border focus:border-brand rounded px-2 py-0.5 outline-none transition-all truncate"
            />
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              previewMode
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border bg-surface text-text-secondary hover:bg-surface-subtle"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{previewMode ? "Edit Mode" : "Live Preview"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveForm}
            className="px-4 py-1.5 bg-brand text-brand-foreground rounded-lg text-xs font-bold hover:bg-brand-hover shadow-xs transition-all flex items-center gap-1.5"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-status-success" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Form</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main 3-Column Editor Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Column: Field Palette */}
        {!previewMode && (
          <aside className="w-64 border-r border-border bg-surface flex flex-col shrink-0 overflow-y-auto hidden md:flex">
            <div className="p-3.5 border-b border-border bg-surface-subtle">
              <h3 className="text-xs font-bold text-text-primary">Add Form Fields</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Click any field to add to canvas</p>
            </div>
            <div className="p-3 space-y-1.5">
              {FIELD_PALETTE.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddField(item.type)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border/80 bg-surface hover:bg-surface-subtle hover:border-brand/40 text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-md bg-surface-subtle border border-border flex items-center justify-center text-text-muted group-hover:text-brand transition-colors shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-text-primary block truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-text-muted block truncate">
                        {item.description}
                      </span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-text-muted group-hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Center Column: Form Canvas Preview */}
        <main className="flex-1 min-w-0 bg-surface-subtle flex flex-col overflow-y-auto p-4 sm:p-8 items-center">
          <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
            {/* Form Title & Description Header */}
            <div className="border-b border-border/70 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
                {settings.design.title || "Form Title"}
              </h2>
              {settings.design.description && (
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  {settings.design.description}
                </p>
              )}
            </div>

            {/* Canvas Field List */}
            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <p className="text-xs font-semibold text-text-muted">No fields added yet</p>
                <p className="text-[11px] text-text-secondary mt-1">
                  Select a field from the left panel to begin designing your form.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {fields.map((f, index) => {
                  const isSelected = selectedFieldId === f.id && !previewMode;
                  const widthClass =
                    f.width === "1/2"
                      ? "w-full md:w-[calc(50%-0.5rem)]"
                      : f.width === "1/3"
                      ? "w-full md:w-[calc(33.333%-0.7rem)]"
                      : f.width === "2/3"
                      ? "w-full md:w-[calc(66.666%-0.4rem)]"
                      : "w-full";

                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        if (!previewMode) {
                          setSelectedFieldId(f.id);
                          setRightTab("field");
                        }
                      }}
                      className={`${widthClass} relative group rounded-xl p-3 border transition-all ${
                        isSelected
                          ? "border-brand bg-brand-soft/20 ring-1 ring-brand"
                          : "border-border/80 hover:border-border hover:bg-surface-subtle"
                      } ${!previewMode ? "cursor-pointer" : ""}`}
                    >
                      {/* Floating actions on hover (when not in preview) */}
                      {!previewMode && (
                        <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-surface border border-border rounded-md px-1 py-0.5 shadow-xs z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveField(index, "up");
                            }}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveField(index, "down");
                            }}
                            disabled={index === fields.length - 1}
                            title="Move Down"
                            className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateField(f.id);
                            }}
                            title="Duplicate"
                            className="p-1 rounded text-text-muted hover:text-text-primary"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(f.id);
                            }}
                            title="Delete"
                            className="p-1 rounded text-text-muted hover:text-status-danger"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Field Label */}
                      <label className="block text-xs font-bold text-text-primary mb-1">
                        {f.label}
                        {f.required && <span className="text-status-danger ml-0.5">*</span>}
                      </label>

                      {/* Field Input Representation */}
                      {f.type === "textarea" ? (
                        <textarea
                          placeholder={f.placeholder}
                          disabled={!previewMode}
                          rows={3}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-80"
                        />
                      ) : f.type === "select" ? (
                        <select
                          disabled={!previewMode}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-80"
                        >
                          <option value="">{f.placeholder || "Select an option..."}</option>
                          {f.options?.map((opt, i) => (
                            <option key={i} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "radio" ? (
                        <div className="space-y-1.5 pt-1">
                          {f.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                              <input type="radio" name={f.name} disabled={!previewMode} />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : f.type === "checkbox" ? (
                        <div className="space-y-1.5 pt-1">
                          {f.options && f.options.length > 0 ? (
                            f.options.map((opt, i) => (
                              <label key={i} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                                <input type="checkbox" disabled={!previewMode} />
                                <span>{opt.label}</span>
                              </label>
                            ))
                          ) : (
                            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                              <input type="checkbox" disabled={!previewMode} />
                              <span>{f.label}</span>
                            </label>
                          )}
                        </div>
                      ) : f.type === "file" ? (
                        <div className="border border-dashed border-border rounded-lg p-3 text-center text-xs text-text-muted bg-surface">
                          <Upload className="w-4 h-4 mx-auto mb-1 opacity-70" />
                          <span>Click to browse or drag file</span>
                        </div>
                      ) : (
                        <input
                          type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                          placeholder={f.placeholder}
                          disabled={!previewMode}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-80"
                        />
                      )}

                      {f.helpText && (
                        <span className="block text-[10px] text-text-muted mt-1">{f.helpText}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form Submit Button */}
            <div
              className={`pt-2 flex ${
                settings.design.submitButtonAlign === "center"
                  ? "justify-center"
                  : settings.design.submitButtonAlign === "right"
                  ? "justify-end"
                  : settings.design.submitButtonAlign === "full"
                  ? "w-full"
                  : "justify-start"
              }`}
            >
              <button
                type="button"
                className={`px-5 py-2.5 rounded-lg text-xs font-bold bg-brand text-brand-foreground shadow-xs transition-opacity hover:opacity-90 ${
                  settings.design.submitButtonAlign === "full" ? "w-full" : ""
                }`}
              >
                {settings.design.submitButtonText || "Submit"}
              </button>
            </div>
          </div>
        </main>

        {/* Right Column: Properties & Design Tabs */}
        {!previewMode && (
          <aside className="w-80 border-l border-border bg-surface flex flex-col shrink-0 overflow-y-auto">
            {/* Tabs Selector */}
            <div className="p-2 border-b border-border bg-surface-subtle flex gap-1">
              <button
                type="button"
                onClick={() => setRightTab("field")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  rightTab === "field"
                    ? "bg-brand text-brand-foreground shadow-2xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Field Settings
              </button>
              <button
                type="button"
                onClick={() => setRightTab("design")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  rightTab === "design"
                    ? "bg-brand text-brand-foreground shadow-2xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Design & Style
              </button>
              <button
                type="button"
                onClick={() => setRightTab("notifications")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  rightTab === "notifications"
                    ? "bg-brand text-brand-foreground shadow-2xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Spam & Alerts
              </button>
            </div>

            {/* Tab 1: Field Properties */}
            {rightTab === "field" && (
              <div className="p-4 space-y-4">
                {selectedField ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Field Type</span>
                      <p className="text-xs font-bold text-brand capitalize">{selectedField.type}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) =>
                          handleUpdateField(selectedField.id, { label: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Internal Variable Name
                      </label>
                      <input
                        type="text"
                        value={selectedField.name}
                        onChange={(e) =>
                          handleUpdateField(selectedField.id, { name: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ""}
                        onChange={(e) =>
                          handleUpdateField(selectedField.id, { placeholder: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Width on Desktop
                      </label>
                      <select
                        value={selectedField.width}
                        onChange={(e) =>
                          handleUpdateField(selectedField.id, {
                            width: e.target.value as FieldWidth,
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                      >
                        <option value="full">Full Width (100%)</option>
                        <option value="1/2">Half Width (50%)</option>
                        <option value="1/3">One Third (33%)</option>
                        <option value="2/3">Two Thirds (66%)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedField.required}
                          onChange={(e) =>
                            handleUpdateField(selectedField.id, { required: e.target.checked })
                          }
                          className="rounded border-border text-brand focus:ring-brand"
                        />
                        <span className="text-xs font-semibold text-text-primary">
                          Required Field
                        </span>
                      </label>
                    </div>

                    {/* Options list for select, radio, checkbox */}
                    {(selectedField.type === "select" ||
                      selectedField.type === "radio" ||
                      selectedField.type === "checkbox") && (
                      <div className="pt-3 border-t border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-text-primary">Options</label>
                          <button
                            type="button"
                            onClick={() => {
                              const opts = selectedField.options || [];
                              handleUpdateField(selectedField.id, {
                                options: [
                                  ...opts,
                                  {
                                    label: `Option ${opts.length + 1}`,
                                    value: `option_${opts.length + 1}`,
                                  },
                                ],
                              });
                            }}
                            className="text-[11px] font-bold text-brand hover:underline"
                          >
                            + Add Option
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {selectedField.options?.map((opt, i) => (
                            <div key={i} className="flex gap-1.5">
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const opts = [...(selectedField.options || [])];
                                  opts[i] = {
                                    ...opts[i],
                                    label: e.target.value,
                                    value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                  };
                                  handleUpdateField(selectedField.id, { options: opts });
                                }}
                                className="flex-1 text-xs px-2 py-1 rounded border border-border bg-surface text-text-primary"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const opts = [...(selectedField.options || [])];
                                  opts.splice(i, 1);
                                  handleUpdateField(selectedField.id, { options: opts });
                                }}
                                className="p-1 text-text-muted hover:text-status-danger"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-text-muted text-xs">
                    Select a field on the canvas to configure its properties.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Design & Style */}
            {rightTab === "design" && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Form Title
                  </label>
                  <input
                    type="text"
                    value={settings.design.title}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        design: { ...settings.design, title: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Form Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.design.description || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        design: { ...settings.design, description: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Submit Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.design.submitButtonText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        design: { ...settings.design, submitButtonText: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Button Alignment
                  </label>
                  <select
                    value={settings.design.submitButtonAlign}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        design: {
                          ...settings.design,
                          submitButtonAlign: e.target.value as FormSettings["design"]["submitButtonAlign"],
                        },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Success Message
                  </label>
                  <input
                    type="text"
                    value={settings.design.successMessage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        design: { ...settings.design, successMessage: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Redirect URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/thank-you"
                    value={settings.design.redirectUrl || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        design: { ...settings.design, redirectUrl: e.target.value },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Spam & Notifications */}
            {rightTab === "notifications" && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailAlertsEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            emailAlertsEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span className="text-xs font-semibold text-text-primary">
                      Email Notification on Submission
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="alerts@domain.com"
                    value={settings.notifications.recipientEmails.join(", ")}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          recipientEmails: e.target.value.split(",").map((s) => s.trim()),
                        },
                      })
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary"
                  />
                </div>

                <div className="pt-3 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.spam.honeypotEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          spam: {
                            ...settings.spam,
                            honeypotEnabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span className="text-xs font-semibold text-text-primary">
                      Honeypot Anti-Spam Shield (Zero CAPTCHA)
                    </span>
                  </label>
                  <p className="text-[11px] text-text-muted mt-1">
                    Silently discards automated bot submissions without burdening genuine visitors with tests.
                  </p>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
