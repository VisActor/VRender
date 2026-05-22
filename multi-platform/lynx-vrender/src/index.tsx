import { root } from '@byted-lynx/react';
import { App } from './App.jsx';

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
