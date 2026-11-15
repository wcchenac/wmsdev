// index.tsx checks the stored token once, before the first render, so a page opened directly
// already finds the user signed in (ProtectedRoute reads the store during that render).

const calls: string[] = [];

vi.mock('../utilities/LocalStorageValidate', () => ({ default: () => calls.push('validate') }));
vi.mock('../App', () => ({ default: () => null }));
vi.mock('react-dom/client', () => ({
  createRoot: () => ({ render: () => calls.push('render') }),
}));

test('index.tsx checks the token once, before the first render', async () => {
  document.body.innerHTML = '<div id="root"></div>';

  await import('../index');

  expect(calls).toEqual(['validate', 'render']);
});
