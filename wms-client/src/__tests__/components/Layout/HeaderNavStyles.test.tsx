import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../reducers';
import { SET_Current_User } from '../../../types';
import Header, { EXPAND_BY_ROLE, navbarExpandFor } from '../../../components/Layout/Header';
import { appCss } from '../../helpers/appCss';

// Each role's navbar expands only from the width where its menu fits on one line, with little
// to spare (Admin about 79px at 1200px, Sales 48px at 576px). Nav links never wrap their text,
// so a long name or a new menu item cannot squeeze a link into several lines.

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const renderHeader = (authority: string | null, fullName = '陳管理') => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  if (authority) {
    store.dispatch({ type: SET_Current_User, payload: { employeeId: 'u', fullName, role: { authority } } });
  }
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/stock/2/2']}>
        <Header />
      </MemoryRouter>
    </Provider>
  );
};

test.each(['ROLE_Admin', 'ROLE_Operator', 'ROLE_Sales', 'ROLE_Normal', null])(
  '%s: every nav link keeps its text on one line',
  (authority) => {
    const { container } = renderHeader(authority);
    const links = [...container.querySelectorAll<HTMLElement>('nav .nav-link')];

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect({ link: link.textContent?.trim(), whiteSpace: getComputedStyle(link).whiteSpace }).toEqual({
        link: link.textContent?.trim(),
        whiteSpace: 'nowrap',
      });
    }
  }
);

// The user's name is the one nav item whose width the app does not control. It is capped and
// ends in an ellipsis when cut, with the full name on hover and in the link's text.
test('a long user name is capped with an ellipsis and kept in full as the title', () => {
  const name = 'Christopher Montgomery';
  const { container } = renderHeader('ROLE_Admin', name);
  const link = [...container.querySelectorAll<HTMLElement>('nav .nav-link')].find((l) =>
    l.textContent?.includes(name)
  )!;
  const label = link.querySelector<HTMLElement>('.navbar-user-name')!;

  expect(link).toHaveAttribute('title', name);
  expect(label).toHaveTextContent(name);
  const cs = getComputedStyle(label);
  // 6em, which jsdom reports in px
  expect({ maxWidth: cs.maxWidth, overflow: cs.overflow, textOverflow: cs.textOverflow }).toEqual({
    maxWidth: `${6 * parseFloat(cs.fontSize)}px`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });
});

// position: sticky only sticks inside its parent. On the nav it had no effect, because its
// parent <header> is exactly as tall as the nav; the header itself (child of the page-long
// div.App) is what stays at the top.
test('the header, not the nav inside it, sticks to the top of the page', () => {
  const { container } = renderHeader('ROLE_Admin');
  const header = container.querySelector('header')!;
  const nav = header.querySelector('nav')!;

  expect({ position: getComputedStyle(header).position, top: getComputedStyle(header).top }).toEqual({
    position: 'sticky',
    top: '0px',
  });
  expect(getComputedStyle(nav).position).not.toBe('sticky');
});

// With the header stuck to the top, an opened toggler menu taller than the window could not be
// scrolled to its last items (登出); it scrolls inside a window-high box instead. jsdom evaluates
// @media only at its fixed 1024px width, so this reads App.css: below every breakpoint a role uses, the collapsed
// menu's rule caps its height (100vh first, for browsers without dvh) and scrolls. Formatting
// and declaration order do not matter.
const COLLAPSE_BELOW: Record<string, string> = { sm: '575.98px', lg: '991.98px', xl: '1199.98px' };

const mediaBlocks = (css: string, query: string): string[] => {
  const blocks: string[] = [];
  const head = new RegExp(`@media\\s*\\(\\s*max-width:\\s*${query.replace('.', '\\.')}\\s*\\)\\s*\\{`, 'g');
  for (let m = head.exec(css); m; m = head.exec(css)) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; depth > 0 && i < css.length; i++) {
      if (css[i] === '{') depth++;
      if (css[i] === '}') depth--;
    }
    blocks.push(css.slice(m.index + m[0].length, i - 1));
  }
  return blocks;
};

// "max-height:calc(...)" and "max-height : calc(...)" both read "max-height: calc(...)".
const normalizeDeclaration = (declaration: string): string => {
  const [property, ...value] = declaration.split(':');
  return value.length ? `${property.trim()}: ${value.join(':').trim().replace(/\s+/g, ' ')}` : '';
};

const declarations = (blocks: string[], selector: string): string[] =>
  blocks.flatMap((block) =>
    [...block.matchAll(/([^{}]+)\{([^}]*)\}/g)]
      .filter(([, sel]) => sel.split(',').some((part) => part.trim().replace(/\s+/g, ' ') === selector))
      .flatMap(([, , body]) => body.split(';').map(normalizeDeclaration).filter(Boolean))
  );

test.each(Object.entries(COLLAPSE_BELOW))(
  'the collapsed navbar-expand-%s menu scrolls within the window',
  (expand, maxWidth) => {
    const css = readFileSync(join(process.cwd(), 'src/App.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const decls = declarations(mediaBlocks(css, maxWidth), `.navbar-expand-${expand} .navbar-collapse`);

    expect(decls).toContain('overflow-y: auto');
    const heights = decls.filter((d) => d.startsWith('max-height:'));
    expect(heights).toEqual([
      'max-height: calc(100vh - var(--navbar-height))',
      'max-height: calc(100dvh - var(--navbar-height))',
    ]);
  }
);

test('every expand breakpoint a role can get has a collapsed-menu rule', () => {
  const used = new Set([...Object.values(EXPAND_BY_ROLE), navbarExpandFor(null)]);
  expect([...used].filter((expand) => !(expand in COLLAPSE_BELOW))).toEqual([]);
});

// The stuck header covers the top of the window, so whatever the browser scrolls into view (the
// 跳至主要內容 target, a field reached with Tab, the first invalid field of a form) is kept below it.
test('scrolling into view leaves room for the stuck header', () => {
  renderHeader('ROLE_Admin');

  // --navbar-height (56px) plus --spacing-2 (0.5rem, 8px)
  expect(getComputedStyle(document.documentElement).scrollPaddingTop).toBe('64px');
});
