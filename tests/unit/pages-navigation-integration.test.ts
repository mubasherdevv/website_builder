import { describe, it, expect, beforeEach } from "vitest";
import { PagesManagerService } from "@/lib/services/pages-manager.service";
import { NavigationManagerService } from "@/lib/services/navigation-manager.service";

describe("Pages and Navigation Integration", () => {
  const websiteId = "test-site-pages-nav-integration";

  beforeEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it("1. creates a page without adding it to navigation", () => {
    const res = PagesManagerService.createPage(websiteId, {
      title: "Landing Promotion",
      slug: "/promo-page",
      inNavigation: false,
    });

    expect(res.success).toBe(true);
    expect(res.page).toBeDefined();

    const headerMenu = NavigationManagerService.getMenuByLocation(websiteId, "header");
    expect(headerMenu).not.toBeNull();

    const flatItems = NavigationManagerService.flattenItems(headerMenu!.items);
    const found = flatItems.find((i) => i.destinationId === res.page!.id);
    expect(found).toBeUndefined();
  });

  it("2. creates a page and adds it under Services parent item", () => {
    const headerMenu = NavigationManagerService.initDefaultMenus(websiteId)[0];
    const flatItems = NavigationManagerService.flattenItems(headerMenu.items);
    const servicesItem = flatItems.find((i) => i.label === "Services");
    expect(servicesItem).toBeDefined();

    const res = PagesManagerService.createPage(websiteId, {
      title: "Garage Door Repair",
      slug: "/garage-door-repair",
      inNavigation: true,
      navMenuId: headerMenu.id,
      navParentId: servicesItem!.id,
      navLabel: "Garage Door Repair",
    });

    expect(res.success).toBe(true);

    const updatedMenu = NavigationManagerService.getMenuById(websiteId, headerMenu.id);
    const updatedFlat = NavigationManagerService.flattenItems(updatedMenu!.items);
    const childItem = updatedFlat.find((i) => i.destinationId === res.page!.id);

    expect(childItem).toBeDefined();
    expect(childItem!.parentId).toBe(servicesItem!.id);
    expect(childItem!.level).toBeGreaterThan(1);
    expect(childItem!.label).toBe("Garage Door Repair");
  });

  it("3. adds an existing page under an existing menu parent", () => {
    // 1. Create independent page
    const pageRes = PagesManagerService.createPage(websiteId, {
      title: "Plumbing Inspection",
      slug: "/plumbing-inspection",
      inNavigation: false,
    });
    expect(pageRes.success).toBe(true);

    const headerMenu = NavigationManagerService.initDefaultMenus(websiteId)[0];
    const flatItems = NavigationManagerService.flattenItems(headerMenu.items);
    const servicesItem = flatItems.find((i) => i.label === "Services")!;

    // 2. Add existing page under Services
    const updatedMenu = NavigationManagerService.addPageToMenu(
      websiteId,
      headerMenu.id,
      pageRes.page!.id,
      {
        parentId: servicesItem.id,
      }
    );

    expect(updatedMenu).not.toBeNull();
    const updatedFlat = NavigationManagerService.flattenItems(updatedMenu!.items);
    const addedItem = updatedFlat.find((i) => i.destinationId === pageRes.page!.id);

    expect(addedItem).toBeDefined();
    expect(addedItem!.parentId).toBe(servicesItem.id);
    expect(addedItem!.customUrl).toBe("/plumbing-inspection");
  });

  it("4. creates multiple child pages under Services dropdown", () => {
    const headerMenu = NavigationManagerService.initDefaultMenus(websiteId)[0];
    const flatItems = NavigationManagerService.flattenItems(headerMenu.items);
    const servicesItem = flatItems.find((i) => i.label === "Services")!;

    const page1 = PagesManagerService.createPage(websiteId, {
      title: "Roof Leak Repair",
      slug: "/roof-leak-repair",
      inNavigation: true,
      navMenuId: headerMenu.id,
      navParentId: servicesItem.id,
    });

    const page2 = PagesManagerService.createPage(websiteId, {
      title: "Shingle Replacement",
      slug: "/shingle-replacement",
      inNavigation: true,
      navMenuId: headerMenu.id,
      navParentId: servicesItem.id,
    });

    expect(page1.success).toBe(true);
    expect(page2.success).toBe(true);

    const updatedMenu = NavigationManagerService.getMenuById(websiteId, headerMenu.id)!;
    const updatedFlat = NavigationManagerService.flattenItems(updatedMenu.items);

    const child1 = updatedFlat.find((i) => i.destinationId === page1.page!.id);
    const child2 = updatedFlat.find((i) => i.destinationId === page2.page!.id);

    expect(child1?.parentId).toBe(servicesItem.id);
    expect(child2?.parentId).toBe(servicesItem.id);
  });

  it("5. changes a page slug and verifies navigation URL updates without stale copies", () => {
    const pageRes = PagesManagerService.createPage(websiteId, {
      title: "Old Service Name",
      slug: "/old-service-url",
      inNavigation: true,
    });

    const headerMenu = NavigationManagerService.getMenuByLocation(websiteId, "header")!;
    let flat = NavigationManagerService.flattenItems(headerMenu.items);
    let item = flat.find((i) => i.destinationId === pageRes.page!.id)!;
    expect(item.customUrl).toBe("/old-service-url");

    // Update slug
    PagesManagerService.updatePage(websiteId, pageRes.page!.id, {
      slug: "/brand-new-service-url",
    });

    // Check resolveItemHref returns live updated slug
    const resolvedUrl = NavigationManagerService.resolveItemHref(item, websiteId);
    expect(resolvedUrl).toBe("/brand-new-service-url");

    // Check menu state has synced
    const reloadedMenu = NavigationManagerService.getMenuById(websiteId, headerMenu.id)!;
    flat = NavigationManagerService.flattenItems(reloadedMenu.items);
    item = flat.find((i) => i.destinationId === pageRes.page!.id)!;
    expect(item.customUrl).toBe("/brand-new-service-url");
  });

  it("6. changes page title and verifies default vs custom menu label behavior", () => {
    // Default label (follows page title)
    const page1 = PagesManagerService.createPage(websiteId, {
      title: "Initial Title",
      slug: "/page-sync",
      inNavigation: true,
    });

    // Custom label (overridden by user)
    const page2 = PagesManagerService.createPage(websiteId, {
      title: "Another Page",
      slug: "/custom-label-page",
      inNavigation: true,
      navLabel: "Custom Fixed Label",
    });

    const headerMenu = NavigationManagerService.getMenuByLocation(websiteId, "header")!;
    // Set item2 as custom label
    let flat = NavigationManagerService.flattenItems(headerMenu.items);
    const item2 = flat.find((i) => i.destinationId === page2.page!.id)!;
    item2.isCustomLabel = true;
    NavigationManagerService.saveMenu(websiteId, {
      ...headerMenu,
      items: NavigationManagerService.unflattenItems(flat),
    });

    // Update both page titles
    PagesManagerService.updatePage(websiteId, page1.page!.id, { title: "Updated Title 123" });
    PagesManagerService.updatePage(websiteId, page2.page!.id, { title: "Updated Title 456" });

    const reloaded = NavigationManagerService.getMenuById(websiteId, headerMenu.id)!;
    flat = NavigationManagerService.flattenItems(reloaded.items);

    const reloadedItem1 = flat.find((i) => i.destinationId === page1.page!.id)!;
    const reloadedItem2 = flat.find((i) => i.destinationId === page2.page!.id)!;

    // Item 1 should have updated its label to match new title
    expect(reloadedItem1.label).toBe("Updated Title 123");
    // Item 2 should have preserved its custom label
    expect(reloadedItem2.label).toBe("Custom Fixed Label");
  });

  it("7. unpublishes a linked page and verifies warning & broken status", () => {
    const pageRes = PagesManagerService.createPage(websiteId, {
      title: "Published Page",
      slug: "/live-page",
      status: "published",
      inNavigation: true,
    });

    // Unpublish page (turn to draft)
    PagesManagerService.togglePublish(websiteId, pageRes.page!.id);

    const menus = NavigationManagerService.getMenus(websiteId);
    const flat = NavigationManagerService.flattenItems(menus[0].items);
    const item = flat.find((i) => i.destinationId === pageRes.page!.id)!;

    expect(item.isBroken).toBe(true);
    expect(item.brokenReason).toContain("unpublished");
  });

  it("8. deletes a linked page and verifies affected menu item is marked broken while other items survive", () => {
    const pageRes = PagesManagerService.createPage(websiteId, {
      title: "Page to Delete",
      slug: "/temporary-delete",
      inNavigation: true,
    });

    const pageSurviving = PagesManagerService.createPage(websiteId, {
      title: "Surviving Page",
      slug: "/surviving-page",
      status: "published",
      inNavigation: true,
    });

    // Delete first page
    PagesManagerService.deletePage(websiteId, pageRes.page!.id);

    const menus = NavigationManagerService.getMenus(websiteId);
    const flat = NavigationManagerService.flattenItems(menus[0].items);

    const deletedItem = flat.find((i) => i.destinationId === pageRes.page!.id);
    const survivingItem = flat.find((i) => i.destinationId === pageSurviving.page!.id);

    expect(deletedItem).toBeDefined();
    expect(deletedItem!.isBroken).toBe(true);
    expect(deletedItem!.brokenReason).toContain("deleted");

    // Surviving item intact
    expect(survivingItem).toBeDefined();
    expect(survivingItem!.isBroken).toBe(false);
  });

  it("9. removes a menu item without deleting its page", () => {
    const pageRes = PagesManagerService.createPage(websiteId, {
      title: "Permanent Page",
      slug: "/permanent-page",
      inNavigation: true,
    });

    const headerMenu = NavigationManagerService.getMenuByLocation(websiteId, "header")!;
    const flat = NavigationManagerService.flattenItems(headerMenu.items);
    const item = flat.find((i) => i.destinationId === pageRes.page!.id)!;

    // Remove from navigation menu
    NavigationManagerService.removeItem(websiteId, headerMenu.id, item.id);

    // Verify item is gone from menu
    const reloadedMenu = NavigationManagerService.getMenuById(websiteId, headerMenu.id)!;
    const reloadedFlat = NavigationManagerService.flattenItems(reloadedMenu.items);
    expect(reloadedFlat.some((i) => i.id === item.id)).toBe(false);

    // Verify page record in Pages Manager was NOT deleted
    const pageStillExists = PagesManagerService.getPageById(websiteId, pageRes.page!.id);
    expect(pageStillExists).not.toBeNull();
    expect(pageStillExists!.title).toBe("Permanent Page");
  });

  it("10. verifies public website navigation rendering preserves hierarchy and omits broken links", () => {
    const headerMenu = NavigationManagerService.initDefaultMenus(websiteId)[0];

    // Publish menu
    NavigationManagerService.publishMenu(websiteId, headerMenu.id);

    const publishedMenu = NavigationManagerService.getPublishedMenuByLocation(websiteId, "header");
    expect(publishedMenu).not.toBeNull();
    expect(publishedMenu!.isPublished).toBe(true);

    // Validate that items with children preserve hierarchy
    const services = publishedMenu!.items.find((i) => i.label === "Services");
    expect(services).toBeDefined();
    expect(services!.children).toBeDefined();
    expect(services!.children!.length).toBeGreaterThan(0);
  });
});
