import { getValue, setValue } from "../../services/repository";
let eventMappers = new Set();

const updateCache = (key, value, type) => {
  const enhancerSettings = getValue("EnhancerSettings") || {};
  if (type === "number") value = parseInt(value);
  enhancerSettings[key] = value || null;
  setValue("EnhancerSettings", enhancerSettings);
};

export const generateTextInput = (
  label,
  placeholder,
  id,
  info,
  value = null,
  type = "number",
  additionalClasses = "settings-field",
  pattern = ".*",
) => {
  const key = Object.keys(id)[0];
  updateCache(key, value || placeholder, type);
  if (value) {
    setTimeout(() => {
      $(`#${id[key]}`).val(value);
    });
  }
  if (!eventMappers.has(key)) {
    $(document).on("input", `#${id[key]}`, ({ target: { value } }) => {
      updateCache(key, value || placeholder, type);
    });
    eventMappers.add(key);
  }
  return `<div class="price-filter ${additionalClasses}">
       <div class="info">
           <span class="secondary label"><button id='${id[key]}_tooltip' style="font-size:16px" class="flat camel-case">${label}</button> :<br/><small>${info}</small></span>
       </div>
       <div class="buttonInfo">
           <div class="inputBox">
               <input pattern="${pattern}" type="${type}" class="numericInput" id='${id[key]}' placeholder=${placeholder}>
           </div>
       </div>
    </div>`;
};
