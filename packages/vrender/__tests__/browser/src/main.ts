import './style.css';
import { pages } from './pages/';

const LOCAL_STORAGE_KEY = 'CANOPUS_DEMOS';

const buildMenuHtml = (filter?: string) => {
  const keyword = filter?.toLowerCase() ?? '';
  return pages
    .map(entry => {
      if (entry.menu && entry.children && entry.children.length) {
        const childrenItems = entry.children
          .filter(
            child =>
              !keyword || child.name.toLowerCase().includes(keyword) || child.path.toLowerCase().includes(keyword)
          )
          .map(child => {
            return `<p class="menu-item" data-path="${child.path}"data-type="${child.type ?? 'spec'}">${
              child.name
            }</p>`;
          });

        if (!childrenItems.length) {
          return '';
        }
        return `<p class="menu-item menu-title">${entry.menu}</p>${childrenItems.join('')}`;
      }

      if (
        keyword &&
        !entry.name.toLowerCase().includes(keyword) &&
        !(entry as any).path?.toLowerCase().includes(keyword)
      ) {
        return '';
      }
      return `<p class="menu-item" data-path="${(entry as any).path}">${entry.name}</p>`;
    })
    .join('');
};

const createSidebar = (node: HTMLDivElement) => {
  node.innerHTML = `
    <div>
      <p class="sidebar-title">组件列表</p>
      <input class="sidebar-search" placeholder="搜索..." />
      <div class="menu-list">
        ${buildMenuHtml()}
      </div>
    </div>
  `;

  const searchInput = node.querySelector<HTMLInputElement>('.sidebar-search')!;
  searchInput.addEventListener('input', () => {
    const menuList = node.querySelector<HTMLDivElement>('.menu-list')!;
    menuList.innerHTML = buildMenuHtml(searchInput.value);
  });
};

const ACTIVE_ITEM_CLS = 'menu-item-active';

const handleClick = (e: { target: any }, isInit?: boolean) => {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const triggerNode = e.target;
  const prevActiveItems = document.getElementsByClassName(ACTIVE_ITEM_CLS);

  container.innerHTML = '';
  if (prevActiveItems && prevActiveItems.length) {
    for (let i = 0; i < prevActiveItems.length; i++) {
      const element = prevActiveItems[i];

      element.classList.remove(ACTIVE_ITEM_CLS);
    }
  }

  if (triggerNode) {
    const path = triggerNode.dataset?.path;
    if (!path) {
      return;
    }

    triggerNode.classList.add(ACTIVE_ITEM_CLS);
    if (!isInit) {
      localStorage.setItem(LOCAL_STORAGE_KEY, path);
    }

    import(path === 'jsx' || path === 'react' ? `./pages/${path}.tsx` : `./pages/${path}.ts`)
      .then(module => {
        container.innerHTML = '<canvas id="main" width=3200 height=1800 style="width: 1600px; height: 900px"></canvas>';

        if (module.page) {
          module.page();
        }
      })
      .catch(err => {
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
  const prevActivePath = localStorage.getItem(LOCAL_STORAGE_KEY);

  createSidebar(sidebarNode);
  initSidebarEvent(sidebarNode);

  const menuItemNodes = document.getElementsByClassName('menu-item');

  handleClick(
    {
      target:
        menuItemNodes &&
        menuItemNodes.length &&
        ([...menuItemNodes].find(node => {
          return prevActivePath && node.dataset.path === prevActivePath;
        }) ||
          menuItemNodes[0])
    },
    true
  );
};

run();
