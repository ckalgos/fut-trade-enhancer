export const sendUINotification = function (message, notificationType) {
  notificationType = notificationType || UINotificationType.POSITIVE;
  services.Notification.queue([message, notificationType]);
};

export const sendPinEvents = (pageId) => {
  services.PIN.sendData(PINEventType.PAGE_VIEW, {
    type: PIN_PAGEVIEW_EVT_TYPE,
    pgid: pageId,
  });
};
