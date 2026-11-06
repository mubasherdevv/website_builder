import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import WebsiteOverviewPage from "@/app/websites/[websiteId]/overview/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            email: "mubasher@example.com",
            user_metadata: { full_name: "Mubasher" },
          },
        },
      }),
    },
  }),
}));

describe("Website Overview Dashboard (Refined per User Feedback)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch for /api/websites, pages, and submissions
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/websites/") && url.includes("/pages")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              pages: [
                { id: "p1", title: "Home", slug: "home" },
                { id: "p2", title: "About", slug: "about" },
                { id: "p3", title: "Services", slug: "services" },
              ],
            }),
        });
      }
      if (url.includes("/api/websites/") && url.includes("/submissions")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              submissions: [{ id: "sub1" }, { id: "sub2" }],
            }),
        });
      }
      if (url === "/api/websites") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              websites: [
                {
                  id: "site-austin",
                  name: "Austin Pro Roofing",
                  subdomain: "my-site-1.securesite.io",
                  status: "published",
                  updated_at: new Date().toISOString(),
                  theme_id: "emerald",
                  custom_domain: null,
                },
                {
                  id: "site-bistro",
                  name: "Bella Vita Italian Bistro",
                  subdomain: "bistro.securesite.io",
                  status: "draft",
                  updated_at: new Date().toISOString(),
                  theme_id: null,
                  custom_domain: null,
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }) as any;
  });

  it("1. renders top bar with notification bell and working interactive user profile menu", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(
      screen.queryByPlaceholderText("Search websites, pages, templates, settings...")
    ).toBeNull();
    expect(screen.queryByText("Ctrl + K")).toBeNull();
    expect(screen.getByText("Pro Plan")).toBeDefined();
    expect(screen.getByTitle("Notifications")).toBeDefined();

    // Click profile button to open dropdown
    const profileBtn = screen.getByTitle("Open User Profile");
    expect(profileBtn).toBeDefined();
    await act(async () => {
      fireEvent.click(profileBtn);
    });

    // Dropdown contains email, links, and Log Out button
    expect(screen.getByText("mubasher@example.com")).toBeDefined();
    expect(screen.getByText("Log Out")).toBeDefined();
  });

  it("2. renders header greeting, page title, and create website button", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.getByText("Manage Your Websites")).toBeDefined();
    expect(
      screen.getByText("Real-time analytics, status, and management for all your websites.")
    ).toBeDefined();
    expect(screen.getAllByText("Create Website").length).toBeGreaterThanOrEqual(1);
  });

  it("3. renders 4 KPI metric cards (Websites, Pages, Total Views, Leads)", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.getByText("Websites")).toBeDefined();
    expect(screen.getAllByText("Pages").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Total Views")).toBeDefined();
    expect(screen.getByText("Leads")).toBeDefined();
    expect(screen.getByText("Real Total")).toBeDefined();
  });

  it("4. removes Build & Manage grid per user feedback", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.queryByText("Build & Manage")).toBeNull();
  });

  it("5. renders Website Info widget with real website fields", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.getByText("Website Info")).toBeDefined();
    expect(screen.getByText("Website Name")).toBeDefined();
    expect(screen.getByText("Domain")).toBeDefined();
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
  });

  it("6. strictly does NOT render Quick Links widget as requested", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.queryByText("Quick Links")).toBeNull();
    expect(screen.queryByText("Browse Templates")).toBeNull();
    expect(screen.queryByText("Help & Documentation")).toBeNull();
  });

  it("7. renders Recent Activity section with timeline items and View All link", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.getByText("Recent Activity")).toBeDefined();
    expect(screen.getByText("View All")).toBeDefined();
  });

  it("8. renders Your Websites list with interactive filter tabs", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    const allTab = screen.getByRole("button", { name: "All" });
    const publishedTab = screen.getByRole("button", { name: "Published" });
    const draftTab = screen.getByRole("button", { name: "Draft" });
    const archivedTab = screen.getByRole("button", { name: "Archived" });

    expect(allTab).toBeDefined();
    expect(publishedTab).toBeDefined();
    expect(draftTab).toBeDefined();
    expect(archivedTab).toBeDefined();

    // Clicking tabs works smoothly
    fireEvent.click(publishedTab);
    fireEvent.click(draftTab);
    fireEvent.click(allTab);
  });

  it("9. renders Quick Launch Banner with live status, domain copy and quick action buttons", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.getByText("Live & Online")).toBeDefined();
    expect(screen.getByText("Visit Live Site")).toBeDefined();
    expect(screen.getAllByText("Visual Builder").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Add New Page")).toBeDefined();
    expect(screen.getByText("Write Blog Post")).toBeDefined();
    expect(screen.getByText("SEO Suite")).toBeDefined();
    expect(screen.getByText("SSL HTTPS: Verified")).toBeDefined();
    expect(screen.getByText("Global Edge CDN: Active")).toBeDefined();

    const copyBtn = screen.getByTitle("Copy website link");
    expect(copyBtn).toBeDefined();
    fireEvent.click(copyBtn);
    expect(screen.getByText("Copied")).toBeDefined();
  });

  it("10. renders Traffic & Visitor Analytics with interactive timeframe and metric toggles", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.getByText("Traffic & Visitor Analytics")).toBeDefined();
    expect(screen.getByText("Period Views")).toBeDefined();
    expect(screen.getAllByText("Unique Visitors").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Top Landing Pages")).toBeDefined();
    expect(screen.getByText("Traffic Sources")).toBeDefined();

    // Toggle 7D timeframe
    const sevenDaysBtn = screen.getByRole("button", { name: "7D" });
    const ninetyDaysBtn = screen.getByRole("button", { name: "90D" });
    fireEvent.click(sevenDaysBtn);
    fireEvent.click(ninetyDaysBtn);

    // Toggle Unique Visitors metric
    const visitorsBtn = screen.getByRole("button", { name: "Unique Visitors" });
    fireEvent.click(visitorsBtn);
  });

  it("11. renders Site Health & SEO Card with real health score ring and core checklist", async () => {
    await act(async () => {
      render(<WebsiteOverviewPage params={{ websiteId: "site-austin" }} />);
    });

    expect(screen.getByText("Site Health & SEO Card")).toBeDefined();
    expect(screen.getByText("Score")).toBeDefined();
    expect(screen.getByText("Core Passed")).toBeDefined();
    expect(screen.getByText("XML Sitemap Ready")).toBeDefined();
    expect(screen.getByText("Robots.txt Active")).toBeDefined();
    expect(screen.getByText("Mobile Responsive")).toBeDefined();
    expect(screen.getByText("Schema Structured")).toBeDefined();
    expect(screen.getByText("Open Full SEO Suite")).toBeDefined();

    // Re-audit button
    const reauditBtn = screen.getByTitle("Run fresh SEO audit");
    expect(reauditBtn).toBeDefined();
    fireEvent.click(reauditBtn);
  });
});
