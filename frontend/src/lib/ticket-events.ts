export const TICKETS_CHANGED = "tickets-changed";

export function notifyTicketsChanged() {
  window.dispatchEvent(new Event(TICKETS_CHANGED));
}
