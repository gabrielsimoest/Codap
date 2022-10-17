import GestureHandler from './GestureHandler';
export default class ManualGestureHandler extends GestureHandler {
  init(ref, propsRef) {
    super.init(ref, propsRef);
  }

  onPointerDown(event) {
    this.tracker.addToTracker(event);
    super.onPointerDown(event);
    this.begin();
  }

  onPointerAdd(event) {
    this.tracker.addToTracker(event);
    super.onPointerAdd(event);
  }

  onPointerMove(event) {
    this.tracker.track(event);
    super.onPointerMove(event);
  }

  onPointerUp(event) {
    super.onPointerUp(event);
    this.tracker.removeFromTracker(event.pointerId);
  }

  onPointerRemove(event) {
    super.onPointerRemove(event);
    this.tracker.removeFromTracker(event.pointerId);
  }

  onPointerCancel(event) {
    super.onPointerCancel(event);
    this.reset();
  }

}
//# sourceMappingURL=ManualGestureHandler.js.map