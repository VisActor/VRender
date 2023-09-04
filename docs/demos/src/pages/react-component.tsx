import React, { useState } from 'react';

export default function () {
  const [count, setCount] = useState(0);
  return (
    <div>
      <div>这是一个组件{count}</div>
      <button onClick={() => setCount(count + 1)}>click</button>
    </div>
  );
}
