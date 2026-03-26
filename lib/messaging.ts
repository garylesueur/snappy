export type Message =
  | { type: "CAPTURE_TAB" }
  | { type: "RESIZE_WINDOW"; width: number; height: number }
  | { type: "RESTORE_WINDOW"; width: number; height: number };

export type MessageResponse =
  | { success: true; dataUrl: string }
  | { success: true; previousWidth: number; previousHeight: number }
  | { success: true }
  | { success: false; error: string };

export function sendMessage(message: Message): Promise<MessageResponse> {
  return browser.runtime.sendMessage(message);
}
