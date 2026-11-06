"use client";

import { useState, useEffect } from "react";
import { NavigationManagerService } from "@/lib/services/navigation-manager.service";
import { NavigationItem, WebsiteMenu } from "@/types/navigation";

export interface FormattedNavItem {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
  children?: FormattedNavItem[];
}

export interface UseHeaderNavigationOptions {
  menuId?: string;
  websiteId?: string;
  fallbackLinks?: Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }>;
  desktopItemLimit?: number;
}

export function useHeaderNavigation({
  menuId,
  websiteId: explicitWebsiteId,
  fallbackLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#services" },
    { label: "About", href: "/#about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ],
  desktopItemLimit = 6,
}: UseHeaderNavigationOptions) {
  const [loadedMenu, setLoadedMenu] = useState<WebsiteMenu | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("/");

  useEffect(() => {
    if (typeof window === "undefined") return;

    setCurrentPath(window.location.pathname);

    const path = window.location.pathname;
    const match = path.match(/\/websites\/([^/]+)/);
    const siteMatch = path.match(/\/site\/([^/]+)/);
    const detectedSite = match ? match[1] : siteMatch ? siteMatch[1] : "default";
    const websiteId = explicitWebsiteId || detectedSite;
    const isEditor = path.includes("/editor/") || path.includes("/websites/");

    const fetchMenu = () => {
      if (menuId) {
        // First check in target website by exact menuId
        let found = NavigationManagerService.getMenuById(websiteId, menuId);
        
        // If not found in draft, check published or all website menus
        if (!found) {
          const allMenus = NavigationManagerService.getMenus(websiteId);
          found = allMenus.find((m) => m.id === menuId) || null;
        }

        if (found) {
          setLoadedMenu(found);
          return;
        }
      }

      const headerMenu = isEditor
        ? (NavigationManagerService.getMenuByLocation(websiteId, "header") || NavigationManagerService.getMenus(websiteId)[0])
        : (NavigationManagerService.getPublishedMenuByLocation(websiteId, "header") || NavigationManagerService.getMenuByLocation(websiteId, "header"));
      if (headerMenu) {
        setLoadedMenu(headerMenu);
      }
    };

    fetchMenu();

    const handleStorage = () => {
      fetchMenu();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("securesite-menu-updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("securesite-menu-updated", handleStorage);
    };
  }, [menuId, explicitWebsiteId]);

  // Convert NavigationItems into hierarchical nav links
  const mapItemToLink = (item: NavigationItem): FormattedNavItem => {
    let resolvedHref = item.customUrl || "/";
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const match = path.match(/\/websites\/([^/]+)/);
      const siteMatch = path.match(/\/site\/([^/]+)/);
      const websiteId = match ? match[1] : siteMatch ? siteMatch[1] : "default";
      resolvedHref = NavigationManagerService.resolveItemHref(item, websiteId);
    }

    return {
      id: item.id,
      label: item.label,
      href: resolvedHref,
      openInNewTab: item.openInNewTab,
      children: item.children ? item.children.filter((c) => c.enabled && !c.isBroken).map(mapItemToLink) : undefined,
    };
  };

  const effectiveItems: FormattedNavItem[] = (menuId && loadedMenu)
    ? loadedMenu.items.filter((i) => i.enabled && !i.isBroken && i.visibility.desktop).map(mapItemToLink)
    : (fallbackLinks && fallbackLinks.length > 0)
    ? fallbackLinks.map((nl, idx) => ({
        id: `nl_${idx}`,
        label: nl.label,
        href: nl.href,
        children: nl.children?.map((c, cIdx) => ({
          id: `nl_${idx}_${cIdx}`,
          label: c.label,
          href: c.href,
        })),
      }))
    : loadedMenu
    ? loadedMenu.items.filter((i) => i.enabled && !i.isBroken && i.visibility.desktop).map(mapItemToLink)
    : [];

  const effectiveItemLimit = loadedMenu?.settings?.maxVisibleTopLevelItems || desktopItemLimit;
  const visibleItems = effectiveItems.length > effectiveItemLimit
    ? effectiveItems.slice(0, effectiveItemLimit)
    : effectiveItems;
  const overflowItems = effectiveItems.length > effectiveItemLimit
    ? effectiveItems.slice(effectiveItemLimit)
    : [];

  const isLinkActive = (href: string) => {
    if (!href || href === "#") return false;
    if (href === "/" && currentPath === "/") return true;
    if (href !== "/" && currentPath.includes(href)) return true;
    return false;
  };

  return {
    loadedMenu,
    menuSettings: loadedMenu?.settings,
    items: effectiveItems,
    visibleItems,
    overflowItems,
    isLinkActive,
  };
}
