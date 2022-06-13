let eventMappers = new Set();

export const generateButton = (id, label, callback, additionalClasses, additionalStyles) => {
  if (!eventMappers.has(id)) {
    initializeListensers(id, callback);
    eventMappers.add(id);
  }
  return `<button class="btn-standard ${additionalClasses}" id="${id}" style="${additionalStyles}">
      <span class="button__text">${label}</span>
  </button>`;
};

const initializeListensers = (id, callback) => {
  $(document).on(
    {
      mouseenter: function () {
        $(this).addClass("hover");
      },
      mouseleave: function () {
        $(this).removeClass("hover");
      },
      click: function () {
        callback();
      },
    },
    `#${id}`
  );
};
