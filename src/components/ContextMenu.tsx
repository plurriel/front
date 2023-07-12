import React, {
  useEffect,
  useContext,
  createContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

import styles from '@/styles/ContextMenu.module.css';

import { State } from '@/lib/utils.js';

interface ContextMenuProps {
  toggledState: State<[number, number] | null>;
  children?: React.ReactNode;
  // nItems: number;
}

interface ContextMenuContextData {
  activeContextMenuState: State<State<[number, number] | null> | null>;
  activeContextMenuEl: State<HTMLElement | null>;
}

const ContextMenuContext = createContext<ContextMenuContextData>(
  undefined as unknown as ContextMenuContextData,
);

export function ContextMenu({
  toggledState,
  children,
  // nItems,
}: ContextMenuProps) {
  // console.log(useContext(ContextMenuContext));
  const {
    activeContextMenuState: [activeContextMenuState, setActiveContextMenuState],
    activeContextMenuEl: [, setActiveContextMenuEl],
  } = useContext(ContextMenuContext);

  const [toggled, setToggled] = toggledState;

  // const [mouseCoords, setMouseCoords] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!toggled) return;
    if (activeContextMenuState && activeContextMenuState[1] !== toggledState[1]) {
      activeContextMenuState[1](null);
      // setActiveContextMenuEl(null);
    }
    setActiveContextMenuState(toggledState);
  }, [toggled]);

  // console.trace();

  // console.log(toggled);

  // const cmElRef = useRef<HTMLDivElement | null>(null);

  // useEffect(() => {
  //   if (cmElRef.current) {
  //     console.log(cmElRef.current);
  //     setActiveContextMenuEl(cmElRef.current);
  //   }
  //   console.log(cmElRef);
  // }, [cmElRef]);
  const handleRef = useCallback((node: HTMLDivElement) => {
    setActiveContextMenuEl(node);
    // console.log('eeeeeeeeee', node);
  }, []);

  const GAP_CONTEXT_MENU = 0;
  const HEIGHT_CM_ITEM = 3;
  const EXTRA_OFFSET = 1;
  const nItems = React.Children.count(children);
  const calcHeightInEm = (nItems - 1) * GAP_CONTEXT_MENU + nItems * HEIGHT_CM_ITEM + EXTRA_OFFSET;

  return (
    toggled
      ? createPortal(
        (
          <div
            style={{
              top: `min(${toggled[1]}px, calc(100vh - ${calcHeightInEm}em))`,
              left: toggled[0] + 192 < window.innerWidth ? toggled[0] : toggled[0] - 192,
            }}
            className={`${styles.context_menu}`}
            ref={handleRef}
          >
            {children}
          </div>
        ),
        document.querySelector('#context_menu_portal') as HTMLDivElement,
      )
      : null
  );
}

export function ContextMenuRoot() {
  // useEffect(() => {}, []);
  return <div id="context_menu_portal" />;
}

export function ContextMenuContextProvider({ children }: { children: React.ReactNode }) {
  const activeContextMenuStateState = useState<State<[number, number] | null> | null>(null);
  const activeContextMenuElState = useState<HTMLElement | null>(null);

  useEffect(() => {
    const listenerFn = ({ target }: { target: EventTarget | null }) => {
      if (activeContextMenuElState[0]
        && !activeContextMenuElState[0].contains(target as HTMLElement)) {
        activeContextMenuElState[1](null);
        activeContextMenuStateState[0]?.[1](null);
        activeContextMenuStateState[1](null);
      }
    };
    document.addEventListener('click', listenerFn);
    return () => document.removeEventListener('click', listenerFn);
  }, [activeContextMenuElState, activeContextMenuStateState]);

  const cmcValue = useMemo(() => ({
    activeContextMenuState: activeContextMenuStateState,
    activeContextMenuEl: activeContextMenuElState,
  }), [activeContextMenuStateState, activeContextMenuElState]);

  return (
    <ContextMenuContext.Provider value={cmcValue}>
      {children}
    </ContextMenuContext.Provider>
  );
}
