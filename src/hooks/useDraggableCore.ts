import { computed, isVue3, ref, Ref, watch, watchEffect } from 'vue-demi';
import { get, createEventHook, MaybeRef, unrefElement, useEventListener, controlledRef } from '@vueuse/core';
import {
  DraggableCoreOptions,
  DraggableCoreState,
  DraggableEvent,
  EventHandler,
  MouseTouchEvent,
  UseDraggableCore
} from '../utils/types';
import {
  addUserSelectStyles,
  getTouchIdentifier,
  matchesSelectorAndParentsTo,
  removeEvent,
  removeUserSelectStyles
} from '../utils/domFns';
import { createCoreData, getControlPosition, snapToGrid } from '../utils/positionFns';
import log from '../utils/log';
import { addEvent } from '../utils/domFns';
import equal from 'fast-deep-equal/es6';

// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  }
};

// Default to mouse events.
let dragEventFor = eventsFor.mouse;

const useDraggableCore = (target: MaybeRef<any>, options: Partial<DraggableCoreOptions>): UseDraggableCore => {
  if (!target) {
    console.warn(
      'You are trying to use <DraggableCore> without passing a valid node reference. This will cause errors down the line.'
    );
  }

  const stateObj: DraggableCoreState = Object.assign(
    {
      enableUserSelectHack: true,
      allowAnyClick: true,
      disabled: false,
      offsetParent: undefined,
      grid: undefined,
      handle: '',
      cancel: '',
      dragged: false,
      update: true,
      slackX: 0,
      slackY: 0,
      scale: 1,
      dragging: false,
      x: 0,
      y: 0,
      touch: 0,
      isElementSVG: false,
      prevPropsPosition: { x: 0, y: 0 },
      start: () => {},
      move: () => {},
      stop: () => {}
    },
    options
  );

  const node = computed(() => unrefElement(target));
  let state: Ref<DraggableCoreState>;

  if (isVue3) {
    state = controlledRef<DraggableCoreState>(stateObj, {
      onBeforeChange(val, oldVal) {
        if (equal(val, oldVal)) {
          return;
        }
      },
      onChanged(val) {
        init();
        onUpdateHook.trigger(val);
      }
    });
  } else {
    state = ref<DraggableCoreState>(stateObj);
    watch(state, (val, oldVal) => {
      if (equal(val, oldVal)) {
        return;
      }
      init();
      onUpdateHook.trigger(val);
    });
  }

  const onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>(),
    onUpdateHook = createEventHook<Partial<DraggableCoreState>>();

  const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
    if (!get(state).allowAnyClick && e.button !== 0) return false;

    if (!get(node) || !get(node).ownerDocument || !get(node).ownerDocument.body) {
      throw new Error('No ref element found on DragStart!');
    }
    const { ownerDocument } = get(node);

    if (
      get(state).disabled ||
      !(ownerDocument.defaultView && e.target instanceof ownerDocument.defaultView.Node) ||
      (get(state).handle && !matchesSelectorAndParentsTo(e.target as Node, get(state).handle, get(node))) ||
      (get(state).cancel && matchesSelectorAndParentsTo(e.target as Node, get(state).cancel, get(node)))
    ) {
      return;
    }

    const isTouch = e.type === 'touchstart';
    if (isTouch) e.preventDefault();
    get(state).touch = getTouchIdentifier(e);

    const position = getControlPosition({
      e,
      touch: get(state).touch,
      node: get(node),
      offsetContainer: get(state).offsetParent,
      scale: get(state).scale
    });
    if (position == null) return;
    const { x, y } = position;

    const coreEvent = createCoreData({
      node: get(node),
      x,
      y,
      lastX: get(state).x,
      lastY: get(state).y
    });

    log('DraggableCore: handleDragStart: %j', coreEvent);

    const shouldUpdate = get(state).start?.(e, coreEvent);
    onDragStartHook.trigger({ event: e, data: coreEvent });
    if ((shouldUpdate || get(state).update) === false) return false;

    if (get(state).enableUserSelectHack) addUserSelectStyles(ownerDocument);

    get(state).dragging = true;
    get(state).x = x;
    get(state).y = y;

    addEvent(ownerDocument, dragEventFor.move, handleDrag);
    addEvent(ownerDocument, dragEventFor.stop, handleDragStop);
  };

  const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
    if (get(node)) {
      const position = getControlPosition({
        e,
        touch: get(state).touch,
        node: get(node),
        offsetContainer: get(state).offsetParent,
        scale: get(state).scale
      });
      if (position == null) return;
      let { x, y } = position;

      // Snap to grid if prop has been provided
      if (Array.isArray(get(state).grid)) {
        let deltaX = x - get(state).x,
          deltaY = y - get(state).y;
        [deltaX, deltaY] = snapToGrid(get(state).grid as [number, number], deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = get(state).x + deltaX;
        y = get(state).y + deltaY;
      }

      const coreEvent = createCoreData({
        node: get(node),
        x,
        y,
        lastX: get(state).x,
        lastY: get(state).y
      });

      log('DraggableCore: handleDrag: %j', coreEvent);

      const shouldUpdate = get(state).move?.(e, coreEvent);
      onDragHook.trigger({ event: e, data: coreEvent });
      if ((shouldUpdate || get(state).update) === false) {
        try {
          handleDragStop(new MouseEvent('mouseup') as MouseTouchEvent);
        } catch (err) {
          // Old browsers
          const event = document.createEvent('MouseEvents') as MouseTouchEvent;
          // I see why this insanity was deprecated
          event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          handleDragStop(event);
        }
        return;
      }

      get(state).x = x;
      get(state).y = y;
    }
  };

  const handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
    if (!get(state).dragging) return;

    if (get(node)) {
      const position = getControlPosition({
        e,
        touch: get(state).touch,
        node: get(node),
        offsetContainer: get(state).offsetParent,
        scale: get(state).scale
      });
      if (position == null) return;
      const { x, y } = position;
      const coreEvent = createCoreData({
        node: get(node),
        x,
        y,
        lastX: get(state).x,
        lastY: get(state).y
      });

      const shouldUpdate = get(state).stop?.(e, coreEvent);
      onDragStopHook.trigger({ event: e, data: coreEvent });
      if ((shouldUpdate || get(state).update) === false) return false;

      if (get(state).enableUserSelectHack) removeUserSelectStyles(get(node).ownerDocument);

      log('DraggableCore: handleDragStop: %j', coreEvent);

      get(state).dragging = false;

      log('DraggableCore: Removing handlers');
      removeEvent(get(node).ownerDocument, dragEventFor.move, handleDrag);
      removeEvent(get(node).ownerDocument, dragEventFor.stop, handleDragStop);
    }
  };

  const onMouseDown: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.mouse;
    if (e.which == 3) return;
    return handleDragStart(e);
  };

  const onMouseUp: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.mouse;
    return handleDragStop(e);
  };

  const onTouchStart: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.touch;
    return handleDragStart(e);
  };

  const onTouchEnd: EventHandler<MouseTouchEvent> = (e) => {
    dragEventFor = eventsFor.touch;
    return handleDragStop(e);
  };

  let initialized = false;
  const init = () => {
    if (get(node) && !initialized) {
      initialized = true;
      useEventListener(get(node), eventsFor.touch.start, onTouchStart, { passive: false });
      useEventListener(get(node), eventsFor.touch.stop, onTouchEnd);
      useEventListener(get(node), eventsFor.mouse.start, onMouseDown);
      useEventListener(get(node), eventsFor.mouse.stop, onMouseUp);
    }
  };

  watchEffect(
    () => {
      init();
    },
    { flush: 'post' }
  );

  return {
    state,
    onUpdated: onUpdateHook.on,
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on
  };
};

export default useDraggableCore;
