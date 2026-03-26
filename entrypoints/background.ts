export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    return true; // keep channel open for async response
  });
});

async function handleMessage(message: { type: string; [key: string]: unknown }) {
  switch (message.type) {
    case "CAPTURE_TAB":
      return captureTab();
    case "RESIZE_WINDOW":
      return resizeWindow(message.width as number, message.height as number);
    case "RESTORE_WINDOW":
      return resizeWindow(message.width as number, message.height as number);
    default:
      return { success: false, error: `Unknown message type: ${message.type}` };
  }
}

async function captureTab() {
  try {
    const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
      format: "png",
    });
    return { success: true, dataUrl };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function resizeWindow(width: number, height: number) {
  try {
    const win = await browser.windows.getCurrent();
    const previousWidth = win.width ?? 0;
    const previousHeight = win.height ?? 0;
    await browser.windows.update(win.id!, { width, height });
    return { success: true, previousWidth, previousHeight };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
