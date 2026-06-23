import './style.css';
import { pages } from './pages/';
import { flattenPages, resolveInitialPath, type IFlatPageEntry } from './harness';

const LOCAL_STORAGE_KEY = 'CANOPUS_DEMOS';
const flatPages = flattenPages(pages as any);
const pageByPath = new Map(flatPages.map(entry => [entry.path, entry]));

interface ISmokeTelemetry {
  isSmokeMode: boolean;
  requestedPath: string | null;
  currentPath: string | null;
  canOpen: boolean;
  pageInvoked: boolean;
  importError: string | null;
  pageError: string | null;
  uncaughtErrors: string[];
  unhandledRejections: string[];
  consoleErrors: string[];
}

declare global {
  interface Window {
    __D3_SMOKE__?: ISmokeTelemetry;
    __D3_PAGE_LIST__?: IFlatPageEntry[];
    __D3_HARNESS_CLEANUP__?: (() => void) | null;
    __D3_REACT_ROOT__?: { unmount?: () => void } | null;
    stage?: { release?: () => void } | null;
  }
}

const createSmokeTelemetry = (requestedPath: string | null, isSmokeMode: boolean): ISmokeTelemetry => ({
  isSmokeMode,
  requestedPath,
  currentPath: null,
  canOpen: false,
  pageInvoked: false,
  importError: null,
  pageError: null,
  uncaughtErrors: [],
  unhandledRejections: [],
  consoleErrors: []
});

const installSmokeHooks = (telemetry: ISmokeTelemetry) => {
  window.__D3_SMOKE__ = telemetry;

  if (!telemetry.isSmokeMode) {
    return;
  }

  window.addEventListener('error', event => {
    telemetry.uncaughtErrors.push(event.error?.stack ?? event.message ?? 'unknown error');
  });

  window.addEventListener('unhandledrejection', event => {
    telemetry.unhandledRejections.push(String(event.reason ?? 'unknown rejection'));
  });

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    telemetry.consoleErrors.push(args.map(arg => String(arg)).join(' '));
    originalConsoleError(...args);
  };
};

const cleanupPreviousPage = () => {
  const stage = window.stage;
  const cleanup = window.__D3_HARNESS_CLEANUP__;

  window.__D3_HARNESS_CLEANUP__ = null;
  window.__D3_REACT_ROOT__?.unmount?.();
  window.__D3_REACT_ROOT__ = null;
  window.stage = null;

  stage?.release?.();
  cleanup?.();
};

const createSidebar = (node: HTMLDivElement) => {
  const specsHtml = pages.map(entry => {
    if (entry.menu && entry.children && entry.children.length) {
      const childrenItems = entry.children.map(child => {
        return `<p class="menu-item" data-path="${child.path}"data-type="${child.type ?? 'spec'}">${child.name}</p>`;
      });

      return `<p class="menu-item menu-title">${entry.menu}</p>${childrenItems.join('')}`;
    }

    return `<p class="menu-item" data-path="${entry.path}">${entry.name}</p>`;
  });

  node.innerHTML = `
    <div>
      <p class="sidebar-title">组件列表</p>
      <div class="menu-list">
        ${specsHtml.join('')}
      </div>
    </div>
  `;
};

const ACTIVE_ITEM_CLS = 'menu-item-active';
const {
  isSmokeMode,
  path: initialPath,
  requestedPath
} = resolveInitialPath(window.location.search, localStorage.getItem(LOCAL_STORAGE_KEY), flatPages);
const smokeTelemetry = createSmokeTelemetry(requestedPath, isSmokeMode);

installSmokeHooks(smokeTelemetry);
window.__D3_PAGE_LIST__ = flatPages;

const handleClick = (e: { target: any }, isInit?: boolean) => {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const root = document.querySelector<HTMLDivElement>('#root')!;
  const footer = document.querySelector<HTMLDivElement>('#footer')!;
  const triggerNode = e.target;
  const prevActiveItems = document.getElementsByClassName(ACTIVE_ITEM_CLS);

  cleanupPreviousPage();
  container.innerHTML = '';
  root.innerHTML = '';
  footer.innerHTML = '';
  if (prevActiveItems && prevActiveItems.length) {
    for (let i = 0; i < prevActiveItems.length; i++) {
      const element = prevActiveItems[i];

      element.classList.remove(ACTIVE_ITEM_CLS);
    }
  }

  if (triggerNode) {
    const path = triggerNode.dataset.path;
    const pageEntry = pageByPath.get(path);

    triggerNode.classList.add(ACTIVE_ITEM_CLS);
    if (!isInit) {
      localStorage.setItem(LOCAL_STORAGE_KEY, path);
    }

    smokeTelemetry.currentPath = path;
    smokeTelemetry.canOpen = false;
    smokeTelemetry.pageInvoked = false;
    smokeTelemetry.importError = null;
    smokeTelemetry.pageError = null;

    import(`./pages/${path}.${pageEntry?.type ?? 'ts'}`)
      .then(module => {
        container.innerHTML = '<canvas id="main" width=3200 height=1800 style="width: 1600px; height: 900px"></canvas>';
        smokeTelemetry.canOpen = true;

        if (module.page) {
          smokeTelemetry.pageInvoked = true;
          try {
            module.page();
          } catch (err) {
            smokeTelemetry.pageError = err instanceof Error ? err.stack ?? err.message : String(err);
            throw err;
          }
        }
      })
      .catch(err => {
        smokeTelemetry.importError = err instanceof Error ? err.stack ?? err.message : String(err);
        console.log(err);
      });
  }
};

let chartInstance: any = null;

const resetFooterContent = (
  callback?: (chartInstance?: any, container?: HTMLDivElement) => ((e: MouseEvent) => void) | void,
  binds?: any[]
) => {
  const footerNode = document.querySelector<HTMLDivElement>('#footer')!;

  footerNode.innerHTML = '';

  if (callback) {
    callback(chartInstance);
  }
};

const initSidebarEvent = (node: HTMLDivElement) => {
  node.addEventListener('click', handleClick);
};

const run = () => {
  const sidebarNode = document.querySelector<HTMLDivElement>('#sidebar')!;

  createSidebar(sidebarNode);
  initSidebarEvent(sidebarNode);

  const menuItemNodes = document.getElementsByClassName('menu-item');

  handleClick(
    {
      target:
        menuItemNodes &&
        menuItemNodes.length &&
        ([...menuItemNodes].find(node => {
          return initialPath && node.dataset.path === initialPath;
        }) ||
          menuItemNodes[0])
    },
    true
  );
};

run();
