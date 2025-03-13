import { createArc } from '@visactor/vrender-core';

const font = `"PingFang SC", "Helvetica Neue", "Microsoft Yahei", system-ui, -apple-system, "segoe ui", Roboto, Helvetica, Arial, sans-serif, "apple color emoji", "segoe ui emoji", "segoe ui symbol"`;
let fontSize = '12px';
function addTest(name: string, cb: () => void) {
  const button = document.createElement('button');
  button.innerText = name;
  button.style.margin = '10px';
  button.addEventListener('click', cb);
  document.body.appendChild(button);
}

export const page = () => {
  addTest('font', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const obj = {
      font: fontSize + font
    };
    function setFont(font: string) {
      if (obj.font === font) {
        return;
      }
      ctx.font = font;
    }
    const ctx = canvas.getContext('2d');
    console.time('font');
    for (let i = 0; i < 10000; i++) {
      const nextFont = fontSize + font;
      ctx.font = nextFont;
    }
    console.timeEnd('font');
    console.time('setFont');
    for (let i = 0; i < 10000; i++) {
      const nextFont = fontSize + font;
      setFont(nextFont);
    }
    console.timeEnd('setFont');
  });
  addTest('array map set', () => {
    const list = new Array(100000).fill(0).map(item => createArc({}));

    let array = [];
    let map = new Map();
    let set = new Set();
    function createArray() {
      list.forEach(item => {
        array.push(item);
      });
    }

    function createMap() {
      list.forEach(item => {
        map.set(item._uid, item);
      });
    }

    function createSet() {
      list.forEach(item => {
        set.add(item);
      });
    }

    function forEachArray() {
      let id = 0;
      array.forEach(item => (id += item._uid));
      return id;
    }

    function forEachMap() {
      let id = 0;
      map.forEach(item => (id += item._uid));
      return id;
    }

    function forEachSet() {
      let id = 0;
      set.forEach(item => (id += item._uid));
      return id;
    }

    function deleteArray() {
      list.forEach(item => {
        array.push(item);
      });
    }

    function delteMap() {
      list.forEach(item => {
        map.delete(item._uid);
      });
    }

    function deletSet() {
      list.forEach(item => {
        set.delete(item);
      });
    }

    console.time('array');
    createArray();
    console.timeEnd('array');

    console.time('map');
    createMap();
    console.timeEnd('map');

    console.time('set');
    createSet();
    console.timeEnd('set');

    console.time('array foreach');
    const arrayCount = forEachArray();
    console.timeEnd('array foreach');

    console.time('map foreach');
    const mapCount = forEachMap();
    console.timeEnd('map foreach');

    console.time('set foreach');
    const setCount = forEachSet();
    console.timeEnd('set foreach');

    console.time('map delete');
    delteMap();
    console.timeEnd('map delete');

    console.time('set delete');
    deletSet();
    console.timeEnd('set delete');

    console.log(list, map, set, arrayCount, mapCount, setCount);
  });
  addTest('raf calls', () => {
    const createRun = () => {
      let i = 0;
      function run() {
        requestAnimationFrame(run);
        i++;
      }
      run();
    };

    for (let i = 0; i < 600; i++) {
      createRun();
    }
  });
  addTest('mock raf', () => {
    class PerformanceRAF {
      nextAnimationFrameCbs: FrameRequestCallback[] = [];

      addAnimationFrameCb(callback: FrameRequestCallback) {
        this.nextAnimationFrameCbs.push(callback);
        // 下一帧执行nextAnimationFrameCbs
        this.tryRunAnimationFrameNextFrame();
        return this.nextAnimationFrameCbs.length - 1;
      }

      protected runAnimationFrame = (time: number) => {
        const cbs = this.nextAnimationFrameCbs;
        this.nextAnimationFrameCbs = [];
        for (let i = 0; i < cbs.length; i++) {
          cbs[i](time);
        }
      };

      protected tryRunAnimationFrameNextFrame = () => {
        if (!(this.nextAnimationFrameCbs && this.nextAnimationFrameCbs.length === 1)) {
          return;
        }
        requestAnimationFrame(this.runAnimationFrame);
      };
    }
    const performanceRAF = new PerformanceRAF();
    const createRun = () => {
      let i = 0;
      function run() {
        performanceRAF.addAnimationFrameCb(run);
        i++;
      }
      run();
    };

    for (let i = 0; i < 600; i++) {
      createRun();
    }
  });
};
