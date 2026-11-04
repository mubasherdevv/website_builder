"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  WebsiteMenu,
  NavigationItem,
  NavigationLocation,
} from "@/types/navigation";
import { NavigationManagerService } from "@/lib/services/navigation-manager.service";
import { PagesManagerService } from "@/lib/services/pages-manager.service";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import { CMSPageItem } from "@/types/cms";
import { BlogPost, BlogCategory } from "@/types/blog";
import { SortableMenuItem } from "@/components/navigation/SortableMenuItem";
import { NavigationItemPropertiesPanel } from "@/components/navigation/NavigationItemPropertiesPanel";
import { NavigationDisplaySettingsPanel } from "@/components/navigation/NavigationDisplaySettingsPanel";
import { NavigationMenuPreview } from "@/components/navigation/NavigationMenuPreview";
import { AddMenuItemModal } from "@/components/navigation/AddMenuItemModal";
import { toast } from "@/components/ui/Toast";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  Plus,
  Compass,
  Check,
  Eye,
  Sliders,
  Copy,
  Trash2,
  Search,
  Save,
  Globe,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface NavigationPageProps {
  params: {
    websiteId: string;
  };
}

export default function NavigationManagerPage({ params }: NavigationPageProps) {
  const { websiteId } = params;

  // Data state
  const [menus, setMenus] = useState<WebsiteMenu[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<"item" | "settings">("settings");

  // Panel sizing and collapse state for flexible desktop layout
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<"compact" | "default" | "wide">("default");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // External data references
  const [pages, setPages] = useState<CMSPageItem[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // UI state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Menu dialog state
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuLocation, setNewMenuLocation] = useState<NavigationLocation>("header");

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load website data
  const loadData = useCallback(async () => {
    // 1. Initial local load
    const loadedMenus = NavigationManagerService.getMenus(websiteId);
    setMenus(loadedMenus);

    if (loadedMenus.length > 0 && !activeMenuId) {
      setActiveMenuId(loadedMenus[0].id);
    }

    const loadedPages = PagesManagerService.getPages(websiteId);
    setPages(loadedPages);

    const loadedPosts = BlogManagerService.getPosts(websiteId);
    setPosts(loadedPosts);

    const loadedCategories = BlogManagerService.getCategories(websiteId);
    setCategories(loadedCategories);

    // 2. Fresh sync from database
    try {
      const dbMenus = await NavigationManagerService.fetchMenusFromDb(websiteId);
      if (dbMenus && dbMenus.length > 0) {
        setMenus(dbMenus);
        if (!activeMenuId) {
          setActiveMenuId(dbMenus[0].id);
        }
      }
    } catch (e) {
      console.warn("Using local navigation cache:", e);
    }
  }, [websiteId, activeMenuId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active menu object
  const activeMenu = menus.find((m) => m.id === activeMenuId) || menus[0] || null;

  // Flat representation of active menu items
  const flatItems = activeMenu ? NavigationManagerService.flattenItems(activeMenu.items) : [];

  // Filtered items by search query
  const filteredItems = searchQuery.trim()
    ? flatItems.filter((i) =>
        i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.customUrl && i.customUrl.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : flatItems;

  // Selected item object
  const selectedItem = flatItems.find((i) => i.id === selectedItemId) || null;

  // Notice toast helper
  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    toast.success(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Update Active Menu state in parent list
  const updateActiveMenuState = (updatedMenu: WebsiteMenu) => {
    setMenus((prev) => prev.map((m) => (m.id === updatedMenu.id ? updatedMenu : m)));
  };

  // Handle active menu change
  const handleSelectMenu = (menuId: string) => {
    setActiveMenuId(menuId);
    setSelectedItemId(null);
  };

  // Create menu
  const handleCreateMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    const created = NavigationManagerService.createMenu(
      websiteId,
      newMenuName.trim(),
      newMenuLocation
    );
    setMenus((prev) => [...prev, created]);
    setActiveMenuId(created.id);
    setNewMenuName("");
    setIsCreatingMenu(false);
    toast.success(`Created menu "${created.name}"`);
  };

  // Duplicate menu
  const handleDuplicateMenu = (menuId: string) => {
    const duplicated = NavigationManagerService.duplicateMenu(websiteId, menuId);
    if (duplicated) {
      setMenus((prev) => [...prev, duplicated]);
      setActiveMenuId(duplicated.id);
      toast.success("Menu duplicated successfully");
    }
  };

  // Delete menu
  const handleDeleteMenu = (menuId: string) => {
    if (menus.length <= 1) {
      toast.warning("At least one menu must remain on the website.");
      return;
    }
    if (confirm("Are you sure you want to delete this menu?")) {
      NavigationManagerService.deleteMenu(websiteId, menuId);
      const remaining = menus.filter((m) => m.id !== menuId);
      setMenus(remaining);
      setActiveMenuId(remaining[0].id);
      toast.success("Menu deleted successfully");
    }
  };

  // Reorder via drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeMenu) return;

    const oldIndex = flatItems.findIndex((item) => item.id === active.id);
    const newIndex = flatItems.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedFlat = arrayMove(flatItems, oldIndex, newIndex);
      const updatedNested = NavigationManagerService.unflattenItems(reorderedFlat);

      const updatedMenu: WebsiteMenu = {
        ...activeMenu,
        items: updatedNested,
      };

      updateActiveMenuState(updatedMenu);
      setHasUnsavedChanges(true);
    }
  };

  // Indent / Outdent
  const handleIndent = (itemId: string) => {
    if (!activeMenu) return;
    const updated = NavigationManagerService.indentItem(websiteId, activeMenu.id, itemId);
    if (updated) {
      updateActiveMenuState(updated);
      setHasUnsavedChanges(true);
    }
  };

  const handleOutdent = (itemId: string) => {
    if (!activeMenu) return;
    const updated = NavigationManagerService.outdentItem(websiteId, activeMenu.id, itemId);
    if (updated) {
      updateActiveMenuState(updated);
      setHasUnsavedChanges(true);
    }
  };

  // Update Item
  const handleUpdateItem = (updatedItem: NavigationItem) => {
    if (!activeMenu) return;
    const updatedFlat = flatItems.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    const updatedNested = NavigationManagerService.unflattenItems(updatedFlat);

    const updatedMenu: WebsiteMenu = {
      ...activeMenu,
      items: updatedNested,
    };

    updateActiveMenuState(updatedMenu);
    setHasUnsavedChanges(true);
  };

  // Toggle item enabled
  const handleToggleItemEnabled = (itemId: string) => {
    if (!activeMenu) return;
    const target = flatItems.find((i) => i.id === itemId);
    if (!target) return;
    handleUpdateItem({ ...target, enabled: !target.enabled });
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    if (!activeMenu) return;
    const updated = NavigationManagerService.removeItem(websiteId, activeMenu.id, itemId);
    if (updated) {
      updateActiveMenuState(updated);
      if (selectedItemId === itemId) setSelectedItemId(null);
      setHasUnsavedChanges(true);
      showNotice("Item removed");
    }
  };

  // Duplicate item
  const handleDuplicateItem = (itemId: string) => {
    if (!activeMenu) return;
    const target = flatItems.find((i) => i.id === itemId);
    if (!target) return;

    NavigationManagerService.addItemToMenu(
      websiteId,
      activeMenu.id,
      {
        ...target,
        label: `${target.label} (Copy)`,
      },
      target.parentId
    );

    loadData();
    setHasUnsavedChanges(true);
    showNotice("Item duplicated");
  };

  // Add Item to Menu
  const handleAddItem = (
    itemData: Partial<NavigationItem> & { label: string; destinationType: NavigationItem["destinationType"] },
    parentId?: string | null
  ) => {
    if (!activeMenu) return;
    const updated = NavigationManagerService.addItemToMenu(
      websiteId,
      activeMenu.id,
      itemData,
      parentId
    );
    if (updated) {
      updateActiveMenuState(updated);
      setHasUnsavedChanges(true);
      showNotice(`Added "${itemData.label}" to menu`);
    }
  };

  // Add Multiple Pages to Menu
  const handleAddMultiplePages = (pageIds: string[], parentId?: string | null) => {
    if (!activeMenu) return;
    const updated = NavigationManagerService.addMultiplePagesToMenu(
      websiteId,
      activeMenu.id,
      pageIds,
      parentId
    );
    if (updated) {
      updateActiveMenuState(updated);
      setHasUnsavedChanges(true);
      showNotice(`Added ${pageIds.length} page(s) to menu`);
    }
  };

  // Save changes
  const handleSaveDraft = async () => {
    if (!activeMenu) return;
    await NavigationManagerService.persistMenuToDb(websiteId, activeMenu);
    setHasUnsavedChanges(false);
    showNotice("Draft menu changes saved");
  };

  // Publish to live site
  const handlePublish = async () => {
    if (!activeMenu) return;
    const published = NavigationManagerService.publishMenu(websiteId, activeMenu.id);
    if (published) {
      await NavigationManagerService.persistMenuToDb(websiteId, published);
    }
    setHasUnsavedChanges(false);
    await loadData();
    showNotice(`Menu "${activeMenu.name}" published to live website!`);
  };

  // Width class resolver for right settings panel
  const getRightPanelWidthClass = () => {
    if (isRightCollapsed) return "w-0 border-l-0 opacity-0 overflow-hidden";
    if (rightPanelWidth === "compact") return "w-72";
    if (rightPanelWidth === "wide") return "w-96";
    return "w-80";
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden bg-surface-subtle">
      {/* Top Action Toolbar */}
      <header className="h-14 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 gap-3">
        {/* Left: Menu Title, Location & Panel Toggles */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Left panel collapse/expand button */}
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-all cursor-pointer shrink-0"
            title={isLeftCollapsed ? "Expand Menus Panel (Arrow)" : "Collapse Menus Panel (Arrow)"}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                isLeftCollapsed ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-5 h-5 text-primary shrink-0" />
            <h1 className="text-xs sm:text-sm font-bold text-text-primary truncate">
              {activeMenu ? activeMenu.name : "Navigation Management"}
            </h1>
          </div>

          {activeMenu && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-subtle border border-border text-text-secondary capitalize shrink-0">
              <Globe className="w-3 h-3 text-text-muted" />
              <span>Location: {activeMenu.location}</span>
            </span>
          )}

          {activeMenu?.isPublished ? (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
              <Check className="w-3 h-3" /> Published
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
              Draft
            </span>
          )}

          {hasUnsavedChanges && (
            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 shrink-0">
              • Unsaved
            </span>
          )}
        </div>

        {/* Feedback notice toast */}
        {statusMessage && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium animate-fade-in shrink-0">
            <Check className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Right Actions: Preview, Save, Publish, Panel Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn border border-border text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn border border-border text-text-primary hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-btn bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors text-xs font-semibold"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>

          {/* Right panel collapse/expand button with arrow */}
          <button
            type="button"
            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-all cursor-pointer shrink-0 ml-1"
            title={isRightCollapsed ? "Expand Settings Panel (Arrow)" : "Collapse Settings Panel (Arrow)"}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-300 ${
                isRightCollapsed ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Main 3-Column CMS Workspace with Smooth Flex Transitions */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* COLUMN 1: Menus Management Sidebar (Left) with Smooth Collapse */}
        <aside
          className={`bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
            isLeftCollapsed ? "w-0 border-r-0 opacity-0 overflow-hidden" : "w-60 lg:w-64"
          }`}
        >
          {/* Top of Sidebar: Header, New Menu, Collapse Arrow */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-subtle/40">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider truncate">
              Website Menus ({menus.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCreatingMenu(true)}
                className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                title="Create New Menu"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsLeftCollapsed(true)}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* New Menu Inline Form */}
          {isCreatingMenu && (
            <form
              onSubmit={handleCreateMenuSubmit}
              className="p-3 border-b border-border bg-primary/5 space-y-2 text-xs"
            >
              <input
                type="text"
                autoFocus
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Menu Name (e.g. Utility Bar)"
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={newMenuLocation}
                onChange={(e) => setNewMenuLocation(e.target.value as NavigationLocation)}
                className="w-full px-2 py-1 rounded border border-border bg-surface text-text-primary text-[11px]"
              >
                <option value="header">Location: Header</option>
                <option value="footer">Location: Footer</option>
                <option value="utility">Location: Utility Navigation</option>
                <option value="custom">Location: Custom Navigation</option>
              </select>
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingMenu(false)}
                  className="px-2 py-1 rounded text-[11px] text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-forest text-white hover:bg-forest-hover text-[11px] font-semibold cursor-pointer transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Menus List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {menus.map((m) => {
              const isActive = m.id === activeMenuId;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMenu(m.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isActive
                      ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                      : "bg-surface hover:bg-surface-subtle/70 border-transparent text-text-secondary"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-text-primary font-medium">{m.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                      <span className="capitalize">{m.location}</span>
                      <span>•</span>
                      <span>{m.items.length} items</span>
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateMenu(m.id);
                      }}
                      title="Duplicate Menu"
                      className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {menus.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMenu(m.id);
                        }}
                        title="Delete Menu"
                        className="p-1 rounded text-text-muted hover:text-status-danger hover:bg-status-danger-soft"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer: Location Assignment Info */}
          {activeMenu && (
            <div className="p-3 border-t border-border bg-surface-subtle/30 text-xs space-y-1.5">
              <label className="block text-[11px] font-semibold text-text-secondary">
                Menu Location
              </label>
              <select
                value={activeMenu.location}
                onChange={(e) => {
                  const updated: WebsiteMenu = {
                    ...activeMenu,
                    location: e.target.value as NavigationLocation,
                  };
                  updateActiveMenuState(updated);
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-2 py-1.5 rounded border border-border bg-surface text-text-primary text-xs"
              >
                <option value="header">Main Header</option>
                <option value="footer">Footer Menu</option>
                <option value="utility">Utility Navigation</option>
                <option value="custom">Custom Navigation</option>
              </select>
            </div>
          )}
        </aside>

        {/* COLUMN 2: Menu Items Hierarchy & dnd-kit Canvas (Center) */}
        <main className="flex-1 flex flex-col bg-surface-subtle min-w-0 overflow-hidden transition-all duration-300">
          {/* Center Toolbar: Search & Add Item & Expand Tabs */}
          <div className="p-3 sm:p-3.5 bg-surface border-b border-border flex items-center justify-between gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-1 max-w-md min-w-0">
              {/* Show button if left panel is collapsed */}
              {isLeftCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsLeftCollapsed(false)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-border bg-surface-subtle hover:bg-surface text-text-secondary hover:text-primary text-xs font-semibold shrink-0 transition-colors"
                  title="Expand Website Menus Panel"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Menus</span>
                </button>
              )}

              {/* Search items */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-surface-subtle/50 text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-primary truncate"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-btn bg-forest text-white hover:bg-forest-hover shadow-xs text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>

              {/* Show button if right panel is collapsed */}
              {isRightCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsRightCollapsed(false)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border bg-surface-subtle hover:bg-surface text-text-secondary hover:text-primary text-xs font-semibold shrink-0 transition-colors"
                  title="Expand Settings Panel"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              )}
            </div>
          </div>

          {/* Drag & Drop Hierarchy Canvas - Fluid width with proper spacing */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
            {flatItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-muted border-2 border-dashed border-border rounded-xl bg-surface/50">
                <Compass className="w-10 h-10 text-primary/40 stroke-1 mb-3" />
                <h3 className="text-sm font-semibold text-text-primary">Menu is Empty</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">
                  This menu currently has no links. Add website pages, blog links, or custom URLs to get started.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-btn bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Menu Item</span>
                </button>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto space-y-1">
                {/* Visual helper badge with count */}
                <div className="flex items-center justify-between text-[11px] text-text-muted px-2 py-1 mb-2">
                  <span className="truncate">
                    Drag to reorder • Use <span className="font-mono">Indent</span> / <span className="font-mono">Outdent</span> for submenus (up to 3 levels)
                  </span>
                  <span className="shrink-0 ml-2 font-medium">{flatItems.length} items total</span>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredItems.map((item, index) => {
                      const isFirst = index === 0;
                      const canIndent = index > 0 && item.level < 3;
                      const canOutdent = item.level > 1;

                      return (
                        <SortableMenuItem
                          key={item.id}
                          item={item}
                          isSelected={selectedItemId === item.id}
                          onSelect={(selected) => {
                            setSelectedItemId(selected.id);
                            setRightPanelTab("item");
                            if (isRightCollapsed) setIsRightCollapsed(false);
                          }}
                          onDelete={handleDeleteItem}
                          onDuplicate={handleDuplicateItem}
                          onIndent={handleIndent}
                          onOutdent={handleOutdent}
                          onToggleEnabled={handleToggleItemEnabled}
                          isFirst={isFirst}
                          canIndent={canIndent}
                          canOutdent={canOutdent}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </main>

        {/* COLUMN 3: Properties & Display Settings Panel (Right) with Width Adjustments & Collapse */}
        <aside
          className={`bg-surface border-l border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out ${getRightPanelWidthClass()}`}
        >
          {/* Panel Tab Selector + Arrow Width Controls */}
          <div className="flex items-center justify-between border-b border-border bg-surface-subtle/50 px-2.5 py-1.5 gap-1.5 shrink-0">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setRightPanelTab("item")}
                className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 truncate ${
                  rightPanelTab === "item"
                    ? "bg-surface shadow-xs text-primary border border-border"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>Item</span>
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab("settings")}
                className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 truncate ${
                  rightPanelTab === "settings"
                    ? "bg-surface shadow-xs text-primary border border-border"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Display</span>
              </button>
            </div>

            {/* Arrow Width Adjuster Controls */}
            <div className="flex items-center gap-0.5 shrink-0 pl-1 border-l border-border/80">
              {/* Decrease width arrow */}
              <button
                type="button"
                onClick={() => {
                  if (rightPanelWidth === "wide") setRightPanelWidth("default");
                  else if (rightPanelWidth === "default") setRightPanelWidth("compact");
                }}
                disabled={rightPanelWidth === "compact"}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:pointer-events-none"
                title="Make panel narrower (Arrow)"
              >
                <Minimize2 className="w-3 h-3" />
              </button>

              {/* Increase width arrow */}
              <button
                type="button"
                onClick={() => {
                  if (rightPanelWidth === "compact") setRightPanelWidth("default");
                  else if (rightPanelWidth === "default") setRightPanelWidth("wide");
                }}
                disabled={rightPanelWidth === "wide"}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface disabled:opacity-30 disabled:pointer-events-none"
                title="Make panel wider (Arrow)"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              {/* Collapse panel arrow */}
              <button
                type="button"
                onClick={() => setIsRightCollapsed(true)}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface"
                title="Collapse Panel (Arrow)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === "item" ? (
              <NavigationItemPropertiesPanel
                item={selectedItem}
                pages={pages}
                posts={posts}
                categories={categories}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                onDuplicate={handleDuplicateItem}
                onClose={() => setSelectedItemId(null)}
              />
            ) : activeMenu ? (
              <NavigationDisplaySettingsPanel
                settings={activeMenu.settings}
                onChange={(updatedSettings) => {
                  const updated: WebsiteMenu = {
                    ...activeMenu,
                    settings: updatedSettings,
                  };
                  updateActiveMenuState(updated);
                  setHasUnsavedChanges(true);
                }}
              />
            ) : null}
          </div>
        </aside>
      </div>

      {/* Add Menu Item Modal */}
      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        pages={pages}
        posts={posts}
        categories={categories}
        parentCandidates={flatItems}
        onAdd={handleAddItem}
        onAddMultiple={handleAddMultiplePages}
      />

      {/* Live Preview Modal Overlay */}
      {isPreviewOpen && activeMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
            <NavigationMenuPreview
              menu={activeMenu}
              websiteName="Austin Pro Roofing"
              onClose={() => setIsPreviewOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
