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
};
