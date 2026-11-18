import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { render } from '@testing-library/react';
import ShrinkRollbackModal from '../components/BO/User/AdminPlatform/ShrinkRollback/RollbackModal';
import InStockRollbackModal from '../components/BO/User/AdminPlatform/InStockRollback/RollbackModal';
import ShipModal from '../components/BO/Stock/Utilities/ShipModal';
import OutStockModal from '../components/BO/Stock/ModifyStock/ModifyBoard/OutStockModal';
import BatchShipModal from '../components/BO/Stock/ModifyStock/ModifyBoard/BatchShipModal';
import ShrinkConfirmModal from '../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkConfirmModal';
import type { StockInfo } from '../types';

// Loads the app's real CSS in the order the browser gets it (index.tsx: Bootstrap, then
// index.css with its design-system imports; App.tsx: App.css) and checks the computed modal
// styles. Since 0d19d49 loads Bootstrap first, App.css wins over Bootstrap here: its
// `.modal-title { color }` overrode the white header colour the titles used to inherit through
// Bootstrap's `.h4`, and its translucent backdrop colour stacked with Bootstrap's opacity.

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

// A stylesheet with its @import rules replaced by the imported files (recursively, resolved
// from the importing file), as the browser applies them, so a new import in index.css is
// picked up here too. Any @import this cannot read fails the test.
const withImports = (path: string): string =>
  read(path).replace(/^@import[^;]*;/gm, (rule) => {
    const target = rule.match(/^@import\s+(?:url\()?\s*['"]([^'"]+)['"]\s*\)?\s*;$/);
    if (!target) throw new Error(`modalStyles.test cannot read ${path}: ${rule}`);
    return withImports(join(dirname(path), target[1]));
  });

const appCss = [
  read('node_modules/bootstrap/dist/css/bootstrap.min.css'),
  withImports('src/index.css'),
  read('src/App.css'),
].join('\n');

// react-bootstrap ends a modal's fade with a setTimeout as long as the computed
// transition-duration (.15s/.3s with Bootstrap's CSS), which would fire after the test
// environment is torn down. Colours do not depend on transitions, so switch them off.
const noTransitions = '.fade, .modal-dialog { transition-duration: 0s !important; }';

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = `${appCss}\n${noTransitions}`;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const noop = () => {};

describe.each([
  ['ShipModal', () => (
    <ShipModal show handleModalClose={noop} outStockReason="" onChange={noop}
      onReansonButtonChange={noop} onCancleShipClick={noop} onShipClick={noop} />
  )],
  ['OutStockModal', () => (
    <OutStockModal show productNo="CF1001" handleModalClose={noop} handleOutStockRequestCreate={noop} />
  )],
  ['BatchShipModal', () => <BatchShipModal show handleModalClose={noop} handleShipList={noop} data={[]} />],
  ['ShrinkConfirmModal', () => (
    <ShrinkConfirmModal show handleModalClose={noop} handleSubmitClick={noop}
      infoLengthCalculation={{ adjustment: 0, totalQuantity: 10, allocation: 0, shrinkType: '' }} />
  )],
  ['InStock RollbackModal', () => <InStockRollbackModal show handleModalClose={noop} handleSubmitClick={noop} list={[]} />],
  ['Shrink RollbackModal', () => (
    <ShrinkRollbackModal show handleModalClose={noop} handleSubmitClick={noop}
      object={{ stockInfo: {} as StockInfo, nodes: [] }} />
  )],
])('%s', (_name, renderModal) => {
  test('the title uses the text colour its coloured header sets', () => {
    render(renderModal());
    const header = document.querySelector<HTMLElement>('.modal.show .modal-header')!;
    const title = header.querySelector<HTMLElement>('.modal-title')!;

    expect(header.style.color).not.toBe('');
    expect(getComputedStyle(title).color).toBe(getComputedStyle(header).color);
  });
});

test('a plain modal header keeps the design-system title colour', () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div id="plain" class="modal-header"><div class="modal-title h4">標題</div></div>'
  );
  const title = document.querySelector('#plain .modal-title')!;

  // --color-gray-800 (#343a40)
  expect(getComputedStyle(title).color).toBe('rgb(52, 58, 64)');
  document.getElementById('plain')!.remove();
});

test('the modal backdrop darkens the page by about 50%', () => {
  document.body.insertAdjacentHTML('beforeend', '<div id="bd" class="modal-backdrop fade show"></div>');
  const cs = getComputedStyle(document.getElementById('bd')!);

  // Black, as rgb(0, 0, 0) or rgba(0, 0, 0, a); anything else fails here with the actual value.
  expect(cs.backgroundColor).toMatch(/^rgba?\(0, 0, 0(, [\d.]+)?\)$/);
  const alpha = Number(cs.backgroundColor.match(/^rgba\(0, 0, 0, ([\d.]+)\)$/)?.[1] ?? '1');
  expect(alpha * Number(cs.opacity)).toBeCloseTo(0.5, 2);
  document.getElementById('bd')!.remove();
});
