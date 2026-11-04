import {
  WebsiteMenu,
  NavigationItem,
  NavigationLocation,
  defaultDisplaySettings,
} from "@/types/navigation";
import { PagesManagerService } from "./pages-manager.service";
import { BlogManagerService } from "./blog-manager.service";
import { generateEntityId } from "@/lib/utils/id";

const STORAGE_PREFIX = "website_";

export class NavigationManagerService {
  private static getStorageKey(websiteId: string): string {
    return `${STORAGE_PREFIX}${websiteId}_menus`;
  }

  private static getPublishedKey(websiteId: string): string {
    return `${STORAGE_PREFIX}${websiteId}_published_menus`;
  }

  /**
   * Initializes default menus for a website if none exist.
   */
  public static initDefaultMenus(websiteId: string): WebsiteMenu[] {
    const existing = this.getRawMenus(websiteId);
    if (existing.length > 0) return existing;

    const headerMenuId = `menu_${generateEntityId("nav")}`;
    const footerMenuId = `menu_${generateEntityId("nav")}`;

    const defaultHeaderMenu: WebsiteMenu = {
      id: headerMenuId,
      websiteId,
      name: "Main Header Menu",
      location: "header",
      isPublished: true,
      settings: { ...defaultDisplaySettings },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      items: [
        {
          id: `item_${generateEntityId("item")}`,
          menuId: headerMenuId,
          label: "Home",
          destinationType: "page",
          destinationId: "page_home",
          customUrl: "/",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 0,
          level: 1,
        },
        {
          id: `item_${generateEntityId("item")}`,
          menuId: headerMenuId,
          label: "Services",
          destinationType: "clickable_parent",
          destinationId: "page_services",
          customUrl: "/services",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 1,
          level: 1,
          children: [
            {
              id: `item_${generateEntityId("item")}`,
              menuId: headerMenuId,
              label: "Roof Inspections",
              destinationType: "section_anchor",
              destinationId: "#services",
              customUrl: "#services",
              visibility: { desktop: true, tablet: true, mobile: true },
              enabled: true,
              order: 0,
              level: 2,
            },
            {
              id: `item_${generateEntityId("item")}`,
              menuId: headerMenuId,
              label: "Commercial Roofing",
              destinationType: "section_anchor",
              destinationId: "#services",
              customUrl: "#services",
              visibility: { desktop: true, tablet: true, mobile: true },
              enabled: true,
              order: 1,
              level: 2,
            },
          ],
        },
        {
          id: `item_${generateEntityId("item")}`,
          menuId: headerMenuId,
          label: "About Us",
          destinationType: "page",
          destinationId: "page_about",
          customUrl: "/about",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 2,
          level: 1,
        },
        {
          id: `item_${generateEntityId("item")}`,
          menuId: headerMenuId,
          label: "Blog",
          destinationType: "blog_listing",
          customUrl: "/blog",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 3,
          level: 1,
        },
        {
          id: `item_${generateEntityId("item")}`,
          menuId: headerMenuId,
          label: "Contact",
          destinationType: "page",
          destinationId: "page_contact",
          customUrl: "/contact",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 4,
          level: 1,
        },
      ],
    };

    const defaultFooterMenu: WebsiteMenu = {
      id: footerMenuId,
      websiteId,
      name: "Footer Navigation",
      location: "footer",
      isPublished: true,
      settings: { ...defaultDisplaySettings, layout: "horizontal", alignment: "center" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      items: [
        {
          id: `item_${generateEntityId("item")}`,
          menuId: footerMenuId,
          label: "Privacy Policy",
          destinationType: "custom_url",
          customUrl: "/privacy",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 0,
          level: 1,
        },
        {
          id: `item_${generateEntityId("item")}`,
          menuId: footerMenuId,
          label: "Terms of Service",
          destinationType: "custom_url",
          customUrl: "/terms",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 1,
          level: 1,
        },
        {
          id: `item_${generateEntityId("item")}`,
          menuId: footerMenuId,
          label: "Contact",
          destinationType: "page",
          destinationId: "page_contact",
          customUrl: "/contact",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 2,
          level: 1,
        },
      ],
    };

    const initial = [defaultHeaderMenu, defaultFooterMenu];
    this.saveRawMenus(websiteId, initial);
    this.savePublishedMenus(websiteId, initial);
    return initial;
  }

  private static getRawMenus(websiteId: string): WebsiteMenu[] {
    if (typeof window === "undefined") {
      return (global as Record<string, unknown>)[this.getStorageKey(websiteId)] as WebsiteMenu[] || [];
    }
    try {
      const item = localStorage.getItem(this.getStorageKey(websiteId));
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  private static saveRawMenus(websiteId: string, menus: WebsiteMenu[]): void {
    if (typeof window === "undefined") {
      (global as Record<string, unknown>)[this.getStorageKey(websiteId)] = menus;
      return;
    }
    try {
      localStorage.setItem(this.getStorageKey(websiteId), JSON.stringify(menus));
    } catch (e) {
      console.error("Failed to save menus to localStorage", e);
    }
  }

  private static getPublishedMenus(websiteId: string): WebsiteMenu[] {
    if (typeof window === "undefined") {
      return (global as Record<string, unknown>)[this.getPublishedKey(websiteId)] as WebsiteMenu[] || [];
    }
    try {
      const item = localStorage.getItem(this.getPublishedKey(websiteId));
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  private static savePublishedMenus(websiteId: string, menus: WebsiteMenu[]): void {
    if (typeof window === "undefined") {
      (global as Record<string, unknown>)[this.getPublishedKey(websiteId)] = menus;
      return;
    }
    try {
      localStorage.setItem(this.getPublishedKey(websiteId), JSON.stringify(menus));
    } catch (e) {
      console.error("Failed to save published menus to localStorage", e);
    }
  }

  /**
   * Retrieves all menus for a specific website with broken links annotated.
   */
  public static getMenus(websiteId: string): WebsiteMenu[] {
    const menus = this.initDefaultMenus(websiteId);
    return menus.map((menu) => ({
      ...menu,
      items: this.validateMenuItems(websiteId, menu.items),
    }));
  }

  /**
   * Retrieves a single menu by ID.
   */
  public static getMenuById(websiteId: string, menuId: string): WebsiteMenu | null {
    const menus = this.getMenus(websiteId);
    return menus.find((m) => m.id === menuId) || null;
  }

  /**
   * Retrieves the active menu for a specific layout location (header, footer, etc.)
   */
  public static getMenuByLocation(
    websiteId: string,
    location: NavigationLocation
  ): WebsiteMenu | null {
    const menus = this.getMenus(websiteId);
    return menus.find((m) => m.location === location) || menus[0] || null;
  }

  /**
   * Retrieves the published menu for public website rendering.
   */
  public static getPublishedMenuByLocation(
    websiteId: string,
    location: NavigationLocation
  ): WebsiteMenu | null {
    const published = this.getPublishedMenus(websiteId);
    const found = published.find((m) => m.location === location && m.isPublished);
    if (found) return found;
    // Fallback to current menu if not yet explicitly published
    return this.getMenuByLocation(websiteId, location);
  }

  /**
   * Creates a new menu.
   */
  public static createMenu(
    websiteId: string,
    name: string,
    location: NavigationLocation = "custom"
  ): WebsiteMenu {
    const menus = this.getMenus(websiteId);
    const newMenu: WebsiteMenu = {
      id: `menu_${generateEntityId("nav")}`,
      websiteId,
      name: name.trim() || "New Menu",
      location,
      isPublished: false,
      items: [],
      settings: { ...defaultDisplaySettings },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...menus, newMenu];
    this.saveRawMenus(websiteId, updated);
    return newMenu;
  }

  /**
   * Renames a menu.
   */
  public static renameMenu(websiteId: string, menuId: string, newName: string): WebsiteMenu | null {
    const menus = this.getMenus(websiteId);
    const target = menus.find((m) => m.id === menuId);
    if (!target) return null;

    target.name = newName.trim();
    target.updatedAt = new Date().toISOString();
    this.saveRawMenus(websiteId, menus);
    return target;
  }

  /**
   * Duplicates an existing menu.
   */
  public static duplicateMenu(websiteId: string, menuId: string): WebsiteMenu | null {
    const menus = this.getMenus(websiteId);
    const target = menus.find((m) => m.id === menuId);
    if (!target) return null;

    const clonedId = `menu_${generateEntityId("nav")}`;
    const cloneItems = (items: NavigationItem[]): NavigationItem[] =>
      items.map((i) => ({
        ...i,
        id: `item_${generateEntityId("item")}`,
        menuId: clonedId,
        children: i.children ? cloneItems(i.children) : undefined,
      }));

    const cloned: WebsiteMenu = {
      ...structuredClone(target),
      id: clonedId,
      name: `${target.name} (Copy)`,
      location: "custom",
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      items: cloneItems(target.items),
    };

    const updated = [...menus, cloned];
    this.saveRawMenus(websiteId, updated);
    return cloned;
  }

  /**
   * Deletes a menu.
   */
  public static deleteMenu(websiteId: string, menuId: string): boolean {
    const menus = this.getMenus(websiteId);
    const filtered = menus.filter((m) => m.id !== menuId);
    if (filtered.length === menus.length) return false;

    this.saveRawMenus(websiteId, filtered);
    return true;
  }

  /**
   * Saves updates to a full menu (including items and display settings).
   */
  public static saveMenu(websiteId: string, updatedMenu: WebsiteMenu): WebsiteMenu {
    const menus = this.getMenus(websiteId);
    const index = menus.findIndex((m) => m.id === updatedMenu.id);
    const now = new Date().toISOString();

    const prepared: WebsiteMenu = {
      ...updatedMenu,
      updatedAt: now,
    };

    if (index >= 0) {
      menus[index] = prepared;
    } else {
      menus.push(prepared);
    }

    this.saveRawMenus(websiteId, menus);

    // If menu was already published, automatically sync published snapshot
    if (prepared.isPublished) {
      const published = this.getPublishedMenus(websiteId);
      const pubIndex = published.findIndex((m) => m.id === prepared.id);
      if (pubIndex >= 0) {
        published[pubIndex] = structuredClone(prepared);
      } else {
        published.push(structuredClone(prepared));
      }
      this.savePublishedMenus(websiteId, published);
    }

    return prepared;
  }

  /**
   * Publishes menu changes to the public website configuration.
   */
  public static publishMenu(websiteId: string, menuId: string): WebsiteMenu | null {
    const menus = this.getMenus(websiteId);
    const target = menus.find((m) => m.id === menuId);
    if (!target) return null;

    target.isPublished = true;
    target.publishedAt = new Date().toISOString();
    target.updatedAt = new Date().toISOString();
    this.saveRawMenus(websiteId, menus);

    // Update published snapshot
    const published = this.getPublishedMenus(websiteId);
    const pubIndex = published.findIndex((m) => m.id === menuId);
    if (pubIndex >= 0) {
      published[pubIndex] = structuredClone(target);
    } else {
      published.push(structuredClone(target));
    }
    this.savePublishedMenus(websiteId, published);

    return target;
  }

  /**
   * Unpublishes a menu.
   */
  public static unpublishMenu(websiteId: string, menuId: string): WebsiteMenu | null {
    const menus = this.getMenus(websiteId);
    const target = menus.find((m) => m.id === menuId);
    if (!target) return null;

    target.isPublished = false;
    target.updatedAt = new Date().toISOString();
    this.saveRawMenus(websiteId, menus);

    const published = this.getPublishedMenus(websiteId).filter((m) => m.id !== menuId);
    this.savePublishedMenus(websiteId, published);

    return target;
  }

  /**
   * Resolves the actual destination URL for a navigation item.
   */
  public static resolveItemHref(item: NavigationItem, websiteId: string): string {
    switch (item.destinationType) {
      case "page": {
        const pages = PagesManagerService.getPages(websiteId);
        const p = pages.find((page) => page.id === item.destinationId || page.slug === item.customUrl);
        return p?.slug || item.customUrl || "/";
      }
      case "blog_listing":
        return "/blog";
      case "blog_post": {
        const posts = BlogManagerService.getPosts(websiteId);
        const post = posts.find((p) => p.id === item.destinationId || p.slug === item.destinationId);
        return post ? `/blog/${post.slug}` : item.customUrl || "/blog";
      }
      case "blog_category": {
        const categories = BlogManagerService.getCategories(websiteId);
        const cat = categories.find((c) => c.id === item.destinationId || c.slug === item.destinationId);
        return cat ? `/blog/category/${cat.slug}` : item.customUrl || "/blog";
      }
      case "section_anchor":
        return item.customUrl?.startsWith("#") ? item.customUrl : `#${item.customUrl || "section"}`;
      case "dropdown_parent":
        return "#";
      case "clickable_parent":
      case "custom_url":
      default:
        return item.customUrl || "#";
    }
  }

  /**
   * Validates menu items against live Pages and Blog data to flag broken links.
   */
  public static validateMenuItems(websiteId: string, items: NavigationItem[]): NavigationItem[] {
    const pages = PagesManagerService.getPages(websiteId);
    const posts = BlogManagerService.getPosts(websiteId);
    const categories = BlogManagerService.getCategories(websiteId);

    const pageMap = new Map(pages.map((p) => [p.id, p]));
    const postMap = new Map(posts.map((p) => [p.id, p]));
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const checkItem = (item: NavigationItem): NavigationItem => {
      let isBroken = false;
      let brokenReason: string | undefined;
      let label = item.label;
      let customUrl = item.customUrl;

      if (item.destinationType === "page") {
        const page = item.destinationId ? pageMap.get(item.destinationId) : undefined;
        if (!page) {
          isBroken = true;
          brokenReason = "Linked page was deleted";
        } else if (page.status !== "published") {
          isBroken = true;
          brokenReason = "Linked page is currently unpublished (Draft)";
          // Keep slug up to date
          customUrl = page.slug;
          if (!item.isCustomLabel) {
            label = page.navLabel || page.title;
          }
        } else {
          isBroken = false;
          brokenReason = undefined;
          customUrl = page.slug;
          if (!item.isCustomLabel) {
            label = page.navLabel || page.title;
          }
        }
      } else if (item.destinationType === "blog_post") {
        const post = item.destinationId ? postMap.get(item.destinationId) : undefined;
        if (!post) {
          isBroken = true;
          brokenReason = "Linked blog post does not exist or was archived";
        } else if (post.status !== "published") {
          isBroken = true;
          brokenReason = "Linked blog post is unpublished (Draft)";
          customUrl = `/blog/${post.slug}`;
        } else {
          customUrl = `/blog/${post.slug}`;
        }
      } else if (item.destinationType === "blog_category") {
        const cat = item.destinationId ? categoryMap.get(item.destinationId) : undefined;
        if (!cat) {
          isBroken = true;
          brokenReason = "Linked blog category was deleted";
        } else {
          customUrl = `/blog/category/${cat.slug}`;
        }
      }

      return {
        ...item,
        label,
        customUrl,
        isBroken,
        brokenReason,
        children: item.children ? item.children.map(checkItem) : undefined,
      };
    };

    return items.map(checkItem);
  }

  /**
   * Flattens a nested item tree into a linear list with correct level and parentId.
   */
  public static flattenItems(
    items: NavigationItem[],
    parentId: string | null = null,
    level: 1 | 2 | 3 = 1
  ): NavigationItem[] {
    const flat: NavigationItem[] = [];
    items.forEach((item, idx) => {
      const current: NavigationItem = {
        ...item,
        parentId,
        level,
        order: idx,
      };
      flat.push(current);
      if (item.children && item.children.length > 0 && level < 3) {
        flat.push(...this.flattenItems(item.children, item.id, (level + 1) as 2 | 3));
      }
    });
    return flat;
  }

  /**
   * Reconstructs a nested tree from a flat list of items.
   */
  public static unflattenItems(flatItems: NavigationItem[]): NavigationItem[] {
    const topLevel: NavigationItem[] = [];
    const itemMap = new Map<string, NavigationItem>();

    // First clone and clear children
    flatItems.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    flatItems.forEach((item) => {
      const mapped = itemMap.get(item.id)!;
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(mapped);
      } else {
        topLevel.push(mapped);
      }
    });

    return topLevel;
  }

  /**
   * Helper to add a new item into a menu.
   */
  public static addItemToMenu(
    websiteId: string,
    menuId: string,
    itemData: Partial<NavigationItem> & { label: string; destinationType: NavigationItem["destinationType"] },
    parentId?: string | null
  ): WebsiteMenu | null {
    const menu = this.getMenuById(websiteId, menuId);
    if (!menu) return null;

    const newItem: NavigationItem = {
      id: `item_${generateEntityId("item")}`,
      menuId,
      label: itemData.label,
      destinationType: itemData.destinationType,
      destinationId: itemData.destinationId,
      customUrl: itemData.customUrl || "/",
      openInNewTab: itemData.openInNewTab || false,
      icon: itemData.icon,
      visibility: itemData.visibility || { desktop: true, tablet: true, mobile: true },
      enabled: itemData.enabled !== undefined ? itemData.enabled : true,
      cssClass: itemData.cssClass,
      description: itemData.description,
      order: 0,
      level: 1,
      parentId: parentId || null,
    };

    const flat = this.flattenItems(menu.items);

    if (parentId) {
      const parent = flat.find((i) => i.id === parentId);
      if (parent) {
        newItem.level = Math.min(3, parent.level + 1) as 1 | 2 | 3;
      }
    }

    flat.push(newItem);
    menu.items = this.unflattenItems(flat);
    return this.saveMenu(websiteId, menu);
  }

  /**
   * Indents an item to become a child of the preceding sibling (up to Level 3).
   */
  public static indentItem(websiteId: string, menuId: string, itemId: string): WebsiteMenu | null {
    const menu = this.getMenuById(websiteId, menuId);
    if (!menu) return null;

    const flat = this.flattenItems(menu.items);
    const index = flat.findIndex((i) => i.id === itemId);
    if (index <= 0) return null; // Cannot indent first item

    const current = flat[index];
    const prev = flat[index - 1];

    if (current.level >= 3) return null; // Max level reached

    current.parentId = prev.id;
    current.level = Math.min(3, prev.level + 1) as 1 | 2 | 3;

    menu.items = this.unflattenItems(flat);
    return this.saveMenu(websiteId, menu);
  }

  /**
   * Outdents an item to move it up a hierarchy level.
   */
  public static outdentItem(websiteId: string, menuId: string, itemId: string): WebsiteMenu | null {
    const menu = this.getMenuById(websiteId, menuId);
    if (!menu) return null;

    const flat = this.flattenItems(menu.items);
    const target = flat.find((i) => i.id === itemId);
    if (!target || target.level <= 1 || !target.parentId) return null;

    const parent = flat.find((i) => i.id === target.parentId);
    target.parentId = parent?.parentId || null;
    target.level = Math.max(1, target.level - 1) as 1 | 2 | 3;

    menu.items = this.unflattenItems(flat);
    return this.saveMenu(websiteId, menu);
  }

  /**
   * Removes an item (and cascades to any descendants).
   */
  public static removeItem(websiteId: string, menuId: string, itemId: string): WebsiteMenu | null {
    const menu = this.getMenuById(websiteId, menuId);
    if (!menu) return null;

    const filterTree = (list: NavigationItem[]): NavigationItem[] =>
      list
        .filter((i) => i.id !== itemId)
        .map((i) => ({
          ...i,
          children: i.children ? filterTree(i.children) : undefined,
        }));

    menu.items = filterTree(menu.items);
    return this.saveMenu(websiteId, menu);
  }

  /**
   * Adds an existing page to a navigation menu (and optionally under a parent menu item).
   */
  public static addPageToMenu(
    websiteId: string,
    menuId: string | undefined,
    pageId: string,
    options?: {
      label?: string;
      parentId?: string | null;
      isCustomLabel?: boolean;
    }
  ): WebsiteMenu | null {
    const targetMenu = menuId
      ? this.getMenuById(websiteId, menuId)
      : this.getMenuByLocation(websiteId, "header") || this.getMenus(websiteId)[0];

    if (!targetMenu) return null;

    const page = PagesManagerService.getPageById(websiteId, pageId);
    if (!page) return null;

    const finalLabel = options?.label?.trim() || page.navLabel || page.title;
    const isCustom = options?.isCustomLabel ?? (finalLabel !== (page.navLabel || page.title));

    return this.addItemToMenu(
      websiteId,
      targetMenu.id,
      {
        label: finalLabel,
        destinationType: "page",
        destinationId: page.id,
        customUrl: page.slug,
        isCustomLabel: isCustom,
        visibility: { desktop: true, tablet: true, mobile: true },
        enabled: true,
      },
      options?.parentId
    );
  }

  /**
   * Adds multiple existing pages to a navigation menu at once.
   */
  public static addMultiplePagesToMenu(
    websiteId: string,
    menuId: string,
    pageIds: string[],
    parentId?: string | null
  ): WebsiteMenu | null {
    let currentMenu: WebsiteMenu | null = this.getMenuById(websiteId, menuId);
    if (!currentMenu) return null;

    for (const pageId of pageIds) {
      currentMenu = this.addPageToMenu(websiteId, menuId, pageId, { parentId });
    }
    return currentMenu;
  }

  /**
   * Responds when a page is deleted in PagesManagerService.
   * Finds any linked menu items across all menus and marks them as broken with the reason.
   */
  public static handlePageDeleted(websiteId: string, pageId: string): void {
    const menus = this.getRawMenus(websiteId);
    let changed = false;

    const markBrokenTree = (items: NavigationItem[]): NavigationItem[] =>
      items.map((item) => {
        let isBroken = item.isBroken;
        let brokenReason = item.brokenReason;

        if (item.destinationType === "page" && item.destinationId === pageId) {
          isBroken = true;
          brokenReason = "Linked page was deleted";
          changed = true;
        }

        return {
          ...item,
          isBroken,
          brokenReason,
          children: item.children ? markBrokenTree(item.children) : undefined,
        };
      });

    const updated = menus.map((menu) => ({
      ...menu,
      items: markBrokenTree(menu.items),
    }));

    if (changed) {
      this.saveRawMenus(websiteId, updated);
    }
  }

  /**
   * Responds when a page is updated (slug, title, navLabel, or status).
   * Synchronizes URL, default labels, and broken state without altering custom labels.
   */
  public static handlePageUpdated(
    websiteId: string,
    pageId: string,
    updatedPage: { slug: string; title: string; navLabel?: string; status: "draft" | "published" | "archived" }
  ): void {
    const menus = this.getRawMenus(websiteId);
    let changed = false;

    const syncTree = (items: NavigationItem[]): NavigationItem[] =>
      items.map((item) => {
        let label = item.label;
        let customUrl = item.customUrl;
        let isBroken = item.isBroken;
        let brokenReason = item.brokenReason;

        if (item.destinationType === "page" && item.destinationId === pageId) {
          changed = true;
          customUrl = updatedPage.slug;

          if (!item.isCustomLabel) {
            label = updatedPage.navLabel || updatedPage.title;
          }

          if (updatedPage.status !== "published") {
            isBroken = true;
            brokenReason = "Linked page is currently unpublished (Draft)";
          } else {
            isBroken = false;
            brokenReason = undefined;
          }
        }

        return {
          ...item,
          label,
          customUrl,
          isBroken,
          brokenReason,
          children: item.children ? syncTree(item.children) : undefined,
        };
      });

    const updated = menus.map((menu) => ({
      ...menu,
      items: syncTree(menu.items),
    }));

    if (changed) {
      this.saveRawMenus(websiteId, updated);
    }
  }

  /**
   * Relinks a broken menu item to another page.
   */
  public static relinkItemToPage(
    websiteId: string,
    menuId: string,
    itemId: string,
    newPageId: string
  ): WebsiteMenu | null {
    const menu = this.getMenuById(websiteId, menuId);
    if (!menu) return null;

    const page = PagesManagerService.getPageById(websiteId, newPageId);
    if (!page) return null;

    const flat = this.flattenItems(menu.items);
    const item = flat.find((i) => i.id === itemId);
    if (!item) return null;

    item.destinationType = "page";
    item.destinationId = page.id;
    item.customUrl = page.slug;
    item.isBroken = page.status !== "published";
    item.brokenReason = page.status !== "published" ? "Linked page is currently unpublished (Draft)" : undefined;

    if (!item.isCustomLabel) {
      item.label = page.navLabel || page.title;
    }

    menu.items = this.unflattenItems(flat);
    return this.saveMenu(websiteId, menu);
  }
}

