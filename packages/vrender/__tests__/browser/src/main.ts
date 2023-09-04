import './style.css';
import { pages } from './pages/';

const LOCAL_STORAGE_KEY = 'CANOPUS_DEMOS';

const createSidebar = (node: HTMLDivElement) => {
  const specsHtml = pages.map(entry => {
    return `<p class="menu-item" data-path="${entry.path}">${entry.title}</p>`;
  });

  node.innerHTML = `
    <div>
      <p class="sidebar-title">页面列表</p>
      <div class="menu-list">
        ${specsHtml.join('')}
      </div>
    </div>
  `;
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
    const path = triggerNode.dataset.path;

    triggerNode.classList.add(ACTIVE_ITEM_CLS);
    if (!isInit) {
      localStorage.setItem(LOCAL_STORAGE_KEY, path);
    }

    import(`./pages/${path}.ts`)
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
