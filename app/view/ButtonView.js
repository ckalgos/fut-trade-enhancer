export const createButton = function (text, callBack, customClass) {
  const stdButton = new UTStandardButtonControl();
  stdButton.init();
  stdButton.addTarget(stdButton, callBack.bind(stdButton), EventType.TAP);
  stdButton.setText(text);

  if (customClass) {
    const classes = customClass.split(" ").filter(Boolean);
    for (let cl of classes) stdButton.getRootElement().classList.add(cl);
  }

  return stdButton;
};
