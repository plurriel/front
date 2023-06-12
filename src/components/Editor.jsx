import React, { createContext, useMemo, useState } from 'react';
import { IconButton } from './IconButton';
import { Bold } from './icons/Bold';

export function Editor({
  content,
  children,
}) {
  const editorData = createContext();
  const contentState = useState(content);

  const contextValue = useMemo(() => ({
    content: contentState,
  }), [contentState]);

  return (
    <editorData.Provider value={contextValue}>
      {children}
    </editorData.Provider>
  );
}

export function ToolBar({ revpad }) {
  return (
    <>
      <IconButton icon={Bold} revpad={revpad} />
      {/* theres gonna be more! */}
    </>
  );
}
