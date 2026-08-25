import { AdminWebController } from './admin-web.controller';
import * as vm from 'vm';

describe('AdminWebController', () => {
  let controller: AdminWebController;

  beforeEach(() => {
    controller = new AdminWebController();
  });

  it('should render HTML page with 200 and correct elements', () => {
    let sentHtml = '';
    let setHeaderKey = '';
    let setHeaderVal = '';

    const mockRes: any = {
      setHeader: (key: string, val: string) => {
        setHeaderKey = key;
        setHeaderVal = val;
      },
      send: (body: string) => {
        sentHtml = body;
      },
    };

    controller.serveAdminApp(mockRes);

    expect(setHeaderKey).toBe('Content-Type');
    expect(setHeaderVal).toContain('text/html');
    expect(sentHtml).toContain('id="login-form"');
    expect(sentHtml).toContain('id="login-username"');
    expect(sentHtml).toContain('id="login-password"');
    expect(sentHtml).toContain('id="login-submit-btn"');
    expect(sentHtml).toContain('/api/v1/auth/login');
  });

  it('should have valid JavaScript syntax in the embedded script', () => {
    let sentHtml = '';
    const mockRes: any = {
      setHeader: () => {},
      send: (body: string) => {
        sentHtml = body;
      },
    };

    controller.serveAdminApp(mockRes);

    const scriptMatch = sentHtml.match(/<script>([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const scriptContent = scriptMatch![1];

    // Validate that the script compiles with zero syntax errors in Node's VM
    expect(() => {
      new vm.Script(scriptContent);
    }).not.toThrow();
  });

  it('should execute login flow on submit and call POST /api/v1/auth/login with phone_or_cpf and password', async () => {
    let sentHtml = '';
    const mockRes: any = {
      setHeader: () => {},
      send: (body: string) => {
        sentHtml = body;
      },
    };

    controller.serveAdminApp(mockRes);

    const scriptMatch = sentHtml.match(/<script>([\s\S]*?)<\/script>/);
    const scriptContent = scriptMatch![1];

    // Setup mock DOM & Browser Environment
    const storage: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: jest.fn((k: string) => storage[k] || null),
      setItem: jest.fn((k: string, v: string) => {
        storage[k] = v;
      }),
      removeItem: jest.fn((k: string) => {
        delete storage[k];
      }),
    };

    const listeners: Record<string, ((e?: any) => void)[]> = {};
    const elements: Record<string, any> = {};

    const createElement = (id: string, overrides: any = {}) => {
      const elListeners: Record<string, ((e?: any) => void)[]> = {};
      const el = {
        id,
        value: '',
        innerText: '',
        innerHTML: '',
        disabled: false,
        type: 'text',
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn().mockReturnValue(false),
        },
        style: {},
        addEventListener: jest.fn((event: string, cb: any) => {
          elListeners[event] = elListeners[event] || [];
          elListeners[event].push(cb);
        }),
        trigger: async (event: string, eventObj: any = {}) => {
          if (elListeners[event]) {
            for (const cb of elListeners[event]) {
              await cb(eventObj);
            }
          }
        },
        querySelectorAll: jest.fn().mockReturnValue([]),
        appendChild: jest.fn(),
        remove: jest.fn(),
        reset: jest.fn(),
        ...overrides,
      };
      elements[id] = el;
      return el;
    };

    // Pre-create known DOM elements
    createElement('login-form');
    createElement('login-username', { value: '12345678901' });
    createElement('login-password', { value: 'Secret123!' });
    createElement('login-submit-btn');
    createElement('toggle-pwd-btn');
    createElement('toast-container');
    createElement('auth-screen');
    createElement('app-layout');
    createElement('user-display-name');
    createElement('user-display-role');
    createElement('user-avatar');
    createElement('page-title');
    createElement('view-dashboard');
    createElement('view-users');
    createElement('view-vehicles');
    createElement('form-user');
    createElement('form-reset-pwd');
    createElement('form-vehicle');
    createElement('user-form-cpf');

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'mock-access-token-xyz',
        refresh_token: 'mock-refresh-token-abc',
        user: {
          id: 'user-admin-1',
          name: 'Carlos Admin',
          role: 'ADMIN',
          cpf: '12345678901',
          status: 'ACTIVE',
        },
      }),
    });

    const context = {
      console: {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
      localStorage: mockLocalStorage,
      fetch: mockFetch,
      document: {
        readyState: 'loading',
        addEventListener: jest.fn((event: string, cb: any) => {
          listeners[event] = listeners[event] || [];
          listeners[event].push(cb);
        }),
        getElementById: (id: string) => elements[id] || null,
        querySelectorAll: () => [],
        createElement: (tag: string) => createElement(`mock-${tag}-${Math.random()}`),
      },
      setTimeout: (fn: any) => fn(),
      clearTimeout: () => {},
      window: {},
      confirm: () => true,
    };

    vm.createContext(context);
    vm.runInContext(scriptContent, context);

    // Verify DOMContentLoaded registered
    expect(context.document.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

    // Fire DOMContentLoaded
    if (listeners['DOMContentLoaded']) {
      for (const cb of listeners['DOMContentLoaded']) {
        cb();
      }
    }

    // Verify login-form listener was attached
    const loginForm = elements['login-form'];
    expect(loginForm.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function));

    // Submit login form
    const preventDefault = jest.fn();
    await loginForm.trigger('submit', { preventDefault });

    expect(preventDefault).toHaveBeenCalled();

    // Assert fetch was called with exact endpoint and payload
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_or_cpf: '12345678901',
        password: 'Secret123!',
      }),
    });

    // Assert tokens and user were saved in localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hk_access_token', 'mock-access-token-xyz');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hk_refresh_token', 'mock-refresh-token-abc');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'hk_user',
      JSON.stringify({
        id: 'user-admin-1',
        name: 'Carlos Admin',
        role: 'ADMIN',
        cpf: '12345678901',
        status: 'ACTIVE',
      }),
    );
  });
});
