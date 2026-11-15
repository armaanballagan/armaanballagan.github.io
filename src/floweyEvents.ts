/* =============================================================================
   FLOWEY EASTER EGG — tiny event bus shared by the Save Files peek
   (FloweyPeek.tsx) and the About game (AboutGame.tsx).

   found → Flowey leaves Save Files and waits on the grass patch in room 3.
   gone  → the fight is over; he can be found peeking in Save Files again.
============================================================================= */

type Listener = () => void;
const foundListeners = new Set<Listener>();
const goneListeners = new Set<Listener>();

export const flowey = {
  /** True between being found in Save Files and the end of the fight. */
  found: false,
  emitFound() {
    this.found = true;
    foundListeners.forEach((listener) => listener());
  },
  emitGone() {
    this.found = false;
    goneListeners.forEach((listener) => listener());
  },
  onFound(listener: Listener) {
    foundListeners.add(listener);
    return () => void foundListeners.delete(listener);
  },
  onGone(listener: Listener) {
    goneListeners.add(listener);
    return () => void goneListeners.delete(listener);
  },
};
