import { describe, it, expect, beforeEach } from "vitest";
import { NavigationManagerService } from "@/lib/services/navigation-manager.service";
import { PagesManagerService } from "@/lib/services/pages-manager.service";
import { BlogManagerService } from "@/lib/services/blog-manager.service";
import { NavigationItem } from "@/types/navigation";

describe("Navigation Management System Unit Tests", () => {
  const TEST_SITE_1 = "test_nav_site_1";
  const TEST_SITE_2 = "test_nav_site_2";

  beforeEach(() => {
    // Clean both localStorage (jsdom) and global memory
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
    delete (global as Record<string, unknown>)[`website_${TEST_SITE_1}_menus`];
    delete (global as Record<string, unknown>)[`website_${TEST_SITE_1}_published_menus`];
    delete (global as Record<string, unknown>)[`website_${TEST_SITE_2}_menus`];
    delete (global as Record<string, unknown>)[`website_${TEST_SITE_2}_published_menus`];
  });

  describe("1. Initialization and Tenant Isolation", () => {
    it("should initialize default header and footer menus for a website", () => {
      const menus = NavigationManagerService.getMenus(TEST_SITE_1);
      expect(menus.length).toBeGreaterThanOrEqual(2);

      const headerMenu = menus.find((m) => m.location === "header");
      expect(headerMenu).toBeDefined();
      expect(headerMenu?.name).toBe("Main Header Menu");
      expect(headerMenu?.items.length).toBeGreaterThan(0);

      const footerMenu = menus.find((m) => m.location === "footer");
      expect(footerMenu).toBeDefined();
      expect(footerMenu?.name).toBe("Footer Navigation");
    });

    it("should strictly enforce tenant isolation between websites", () => {
      const site1Menus = NavigationManagerService.getMenus(TEST_SITE_1);
      const site2Menus = NavigationManagerService.getMenus(TEST_SITE_2);

      // Create custom menu on site 1
      NavigationManagerService.createMenu(TEST_SITE_1, "Site 1 Exclusive Nav", "custom");

      const updatedSite1 = NavigationManagerService.getMenus(TEST_SITE_1);
      const updatedSite2 = NavigationManagerService.getMenus(TEST_SITE_2);

      expect(updatedSite1.some((m) => m.name === "Site 1 Exclusive Nav")).toBe(true);
      expect(updatedSite2.some((m) => m.name === "Site 1 Exclusive Nav")).toBe(false);
    });
  });

  describe("2. Menu CRUD Operations", () => {
    it("should create, rename, and duplicate menus correctly", () => {
      const created = NavigationManagerService.createMenu(TEST_SITE_1, "Utility Bar", "utility");
      expect(created.name).toBe("Utility Bar");
      expect(created.location).toBe("utility");

      const renamed = NavigationManagerService.renameMenu(TEST_SITE_1, created.id, "Top Announcement Bar");
      expect(renamed?.name).toBe("Top Announcement Bar");

      const duplicated = NavigationManagerService.duplicateMenu(TEST_SITE_1, created.id);
      expect(duplicated).toBeDefined();
      expect(duplicated?.name).toBe("Top Announcement Bar (Copy)");
      expect(duplicated?.id).not.toBe(created.id);
    });

    it("should delete menu while keeping remaining menus intact", () => {
      const created = NavigationManagerService.createMenu(TEST_SITE_1, "Menu To Delete", "custom");
      const beforeDelete = NavigationManagerService.getMenus(TEST_SITE_1);
      expect(beforeDelete.some((m) => m.id === created.id)).toBe(true);

      const result = NavigationManagerService.deleteMenu(TEST_SITE_1, created.id);
      expect(result).toBe(true);

      const afterDelete = NavigationManagerService.getMenus(TEST_SITE_1);
      expect(afterDelete.some((m) => m.id === created.id)).toBe(false);
    });
  });

  describe("3. Menu Item Management & Destination Types", () => {
    it("should add various destination items to a menu", () => {
      const menu = NavigationManagerService.getMenus(TEST_SITE_1)[0];

      // Add page item
      const updatedAfterPage = NavigationManagerService.addItemToMenu(TEST_SITE_1, menu.id, {
        label: "Our Pricing",
        destinationType: "page",
        destinationId: "page_services",
        customUrl: "/services",
      });
      expect(updatedAfterPage?.items.some((i) => i.label === "Our Pricing")).toBe(true);

      // Add blog category item
      const updatedAfterCat = NavigationManagerService.addItemToMenu(TEST_SITE_1, menu.id, {
        label: "Maintenance Category",
        destinationType: "blog_category",
        destinationId: "maintenance",
        customUrl: "/blog/category/maintenance",
      });
      expect(updatedAfterCat?.items.some((i) => i.label === "Maintenance Category")).toBe(true);

      // Add Section Anchor
      const updatedAfterAnchor = NavigationManagerService.addItemToMenu(TEST_SITE_1, menu.id, {
        label: "Jump to Reviews",
        destinationType: "section_anchor",
        customUrl: "#reviews",
      });
      expect(updatedAfterAnchor?.items.some((i) => i.label === "Jump to Reviews")).toBe(true);
    });

    it("should remove items and cascade deletion to descendants", () => {
      const menu = NavigationManagerService.getMenus(TEST_SITE_1)[0];
      // Target Services which has child subitems in default seed
      const servicesItem = menu.items.find((i) => i.label === "Services");
      expect(servicesItem).toBeDefined();
      expect(servicesItem?.children?.length).toBeGreaterThan(0);

      NavigationManagerService.removeItem(TEST_SITE_1, menu.id, servicesItem!.id);
      const reloaded = NavigationManagerService.getMenuById(TEST_SITE_1, menu.id);
      expect(reloaded?.items.some((i) => i.id === servicesItem!.id)).toBe(false);
    });
  });

  describe("4. Hierarchy, Indentation and 3-Level Nesting", () => {
    it("should flatten and unflatten item trees consistently", () => {
      const menu = NavigationManagerService.getMenus(TEST_SITE_1)[0];
      const flat = NavigationManagerService.flattenItems(menu.items);
      expect(flat.length).toBeGreaterThan(menu.items.length); // includes children

      const reconstructed = NavigationManagerService.unflattenItems(flat);
      expect(reconstructed.length).toBe(menu.items.length);
      expect(reconstructed[1].children?.length).toBe(menu.items[1].children?.length);
    });

    it("should support indenting items up to Level 3 and outdenting", () => {
      const menu = NavigationManagerService.createMenu(TEST_SITE_1, "Hierarchy Test Menu", "custom");

      // Add parent item
      NavigationManagerService.addItemToMenu(TEST_SITE_1, menu.id, {
        label: "Level 1 Parent",
        destinationType: "dropdown_parent",
      });

      // Add child candidate
      NavigationManagerService.addItemToMenu(TEST_SITE_1, menu.id, {
        label: "Level 2 Child",
        destinationType: "custom_url",
        customUrl: "/child",
      });

      // Add grandchild candidate
      NavigationManagerService.addItemToMenu(TEST_SITE_1, menu.id, {
        label: "Level 3 Grandchild",
        destinationType: "custom_url",
        customUrl: "/grandchild",
      });

      let current = NavigationManagerService.getMenuById(TEST_SITE_1, menu.id)!;
      let flat = NavigationManagerService.flattenItems(current.items);
      const childItem = flat.find((i) => i.label === "Level 2 Child")!;
      const grandchildItem = flat.find((i) => i.label === "Level 3 Grandchild")!;

      // Indent child
      const afterChildIndent = NavigationManagerService.indentItem(TEST_SITE_1, menu.id, childItem.id);
      expect(afterChildIndent).toBeDefined();
      flat = NavigationManagerService.flattenItems(afterChildIndent!.items);
      const updatedChild = flat.find((i) => i.id === childItem.id)!;
      expect(updatedChild.level).toBe(2);

      // Indent grandchild under child
      const afterGrandchildIndent = NavigationManagerService.indentItem(TEST_SITE_1, menu.id, grandchildItem.id);
      expect(afterGrandchildIndent).toBeDefined();
      flat = NavigationManagerService.flattenItems(afterGrandchildIndent!.items);
      const updatedGrandchild = flat.find((i) => i.id === grandchildItem.id)!;
      expect(updatedGrandchild.level).toBe(3);

      // Attempting to indent beyond Level 3 should be rejected
      const invalidIndent = NavigationManagerService.indentItem(TEST_SITE_1, menu.id, grandchildItem.id);
      expect(invalidIndent).toBeNull();

      // Outdent grandchild back to Level 2
      const afterOutdent = NavigationManagerService.outdentItem(TEST_SITE_1, menu.id, grandchildItem.id);
      flat = NavigationManagerService.flattenItems(afterOutdent!.items);
      const outdented = flat.find((i) => i.id === grandchildItem.id)!;
      expect(outdented.level).toBe(2);
    });
  });

  describe("5. Broken Link Validation & URL Resolution", () => {
    it("should flag broken links when referenced pages or blog items do not exist", () => {
      const items: NavigationItem[] = [
        {
          id: "item_valid_page",
          menuId: "m1",
          label: "Valid Page",
          destinationType: "page",
          destinationId: "page_home",
          customUrl: "/",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 0,
          level: 1,
        },
        {
          id: "item_broken_page",
          menuId: "m1",
          label: "Deleted Page",
          destinationType: "page",
          destinationId: "non_existent_page_id",
          customUrl: "/deleted-page",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 1,
          level: 1,
        },
        {
          id: "item_broken_blog",
          menuId: "m1",
          label: "Missing Article",
          destinationType: "blog_post",
          destinationId: "missing_article_id",
          visibility: { desktop: true, tablet: true, mobile: true },
          enabled: true,
          order: 2,
          level: 1,
        },
      ];

      const validated = NavigationManagerService.validateMenuItems(TEST_SITE_1, items);

      expect(validated[0].isBroken).toBe(false);
      expect(validated[1].isBroken).toBe(true);
      expect(validated[1].brokenReason).toBeDefined();
      expect(validated[2].isBroken).toBe(true);
    });

    it("should correctly resolve destination URLs for public rendering", () => {
      const pageItem: NavigationItem = {
        id: "i1",
        menuId: "m1",
        label: "Contact",
        destinationType: "page",
        destinationId: "page_contact",
        customUrl: "/contact",
        visibility: { desktop: true, tablet: true, mobile: true },
        enabled: true,
        order: 0,
        level: 1,
      };

      const blogListingItem: NavigationItem = {
        id: "i2",
        menuId: "m1",
        label: "Blog",
        destinationType: "blog_listing",
        visibility: { desktop: true, tablet: true, mobile: true },
        enabled: true,
        order: 1,
        level: 1,
      };

      const anchorItem: NavigationItem = {
        id: "i3",
        menuId: "m1",
        label: "Reviews",
        destinationType: "section_anchor",
        customUrl: "testimonials",
        visibility: { desktop: true, tablet: true, mobile: true },
        enabled: true,
        order: 2,
        level: 1,
      };

      expect(NavigationManagerService.resolveItemHref(pageItem, TEST_SITE_1)).toBe("/contact");
      expect(NavigationManagerService.resolveItemHref(blogListingItem, TEST_SITE_1)).toBe("/blog");
      expect(NavigationManagerService.resolveItemHref(anchorItem, TEST_SITE_1)).toBe("#testimonials");
    });
  });

  describe("6. Save & Publishing Workflow", () => {
    it("should save draft menu changes and publish cleanly to live website configuration", () => {
      const menu = NavigationManagerService.getMenus(TEST_SITE_1)[0];

      // Mutate draft settings
      menu.settings.alignment = "center";
      menu.settings.stickyHeader = false;
      NavigationManagerService.saveMenu(TEST_SITE_1, menu);

      const reloadedDraft = NavigationManagerService.getMenuById(TEST_SITE_1, menu.id);
      expect(reloadedDraft?.settings.alignment).toBe("center");
      expect(reloadedDraft?.settings.stickyHeader).toBe(false);

      // Publish menu
      const published = NavigationManagerService.publishMenu(TEST_SITE_1, menu.id);
      expect(published?.isPublished).toBe(true);
      expect(published?.publishedAt).toBeDefined();

      const liveMenu = NavigationManagerService.getPublishedMenuByLocation(TEST_SITE_1, "header");
      expect(liveMenu?.id).toBe(menu.id);
      expect(liveMenu?.settings.alignment).toBe("center");
    });
  });
});
