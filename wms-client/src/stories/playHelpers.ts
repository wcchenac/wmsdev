// Small DOM helpers and fixtures shared by story play functions.
import { expect, userEvent, waitFor, within } from "storybook/test";

/** Text of each top-level navbar entry (links and dropdown toggles), in order. */
export function navLabels(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>(".navbar-nav > li > .nav-link")).map(
    (el) => el.textContent?.trim() ?? ""
  );
}

/** Top-level navbar entries each role sees (RoleHeader/Header*.tsx). */
export const ROLE_NAV = {
  admin: ["入庫作業", "庫存查詢", "出庫單查詢", "庫存異動作業", "拉貨明細", "歷史記錄查詢", "檔案總管", "管理員區域"],
  operator: ["入庫作業", "庫存查詢", "庫存異動作業", "拉貨明細", "歷史記錄查詢"],
  normal: ["庫存查詢", "出庫單查詢"],
  sales: ["庫存查詢", "歷史記錄查詢"],
};

/** Links under the 入庫作業 and 庫存異動作業 dropdowns (admin and operator). */
export const STOCK_IN_LINKS: [string, string][] = [
  ["進貨單入庫", "/stock/1/1"],
  ["組裝單入庫", "/stock/1/2"],
  ["退貨單入庫", "/stock/1/3"],
  ["調撥單入庫", "/stock/1/4"],
];
export const STOCK_MODIFY_LINKS: [string, string][] = [
  ["庫存異動", "/stock/3/1"],
  ["減肥清單", "/stock/3/2"],
];

/** Opens a navbar dropdown and checks its links, then closes it again. */
export async function expectDropdownLinks(root: HTMLElement, toggleName: string, links: [string, string][]) {
  const canvas = within(root);
  const toggle = canvas.getByRole("button", { name: toggleName });
  await userEvent.click(toggle);
  const menu = toggle.parentElement!.querySelector<HTMLElement>(".dropdown-menu")!;
  await waitFor(() => expect(menu).toHaveClass("show"));
  const items = Array.from(menu.querySelectorAll<HTMLAnchorElement>("a.dropdown-item"), (a) => [
    a.textContent?.trim() ?? "",
    a.getAttribute("href"),
  ]);
  await expect(items).toEqual(links);
  await userEvent.click(toggle);
  await waitFor(() => expect(menu).not.toHaveClass("show"));
}

/** Checks a top-level nav link's target. */
export async function expectNavHref(root: HTMLElement, name: string, href: string) {
  const link = Array.from(root.querySelectorAll<HTMLAnchorElement>(".navbar-nav > li > a.nav-link")).find(
    (a) => a.textContent?.trim() === name
  );
  await expect(link).toBeDefined();
  await expect(link).toHaveAttribute("href", href);
}
