export const generateButton = (id, label, callback, additionalClasses) => {
  initializeListensers(id, callback);
  return `<button class="btn-standard ${additionalClasses}" id="${id}">
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
