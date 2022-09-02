import { getValue, setValue } from "../../services/repository";
let eventMappers = new Set();

const clickHandler = (key, evt) => {
  const enhancerSetting = getValue("EnhancerSettings") || {};
  if (enhancerSetting[key]) {
    enhancerSetting[key] = false;
    $(evt.currentTarget).removeClass("toggled");
  } else {
    enhancerSetting[key] = true;
    $(evt.currentTarget).addClass("toggled");
  }
  setValue("EnhancerSettings", enhancerSetting);
};

const resetToDefault = (key) => {
  const enhancerSetting = getValue("EnhancerSettings") || {};
  enhancerSetting[key] = false;
  setValue("EnhancerSettings", enhancerSetting);
};

export const generateToggleInput = (
  label,
  id,
  info,
  isToggled,
  additionalClasses = "settings-field"
) => {
  const key = Object.keys(id)[0];
  if (isToggled) {
    resetToDefault(key);
    setTimeout(() => {
      $(`#${id[key]}`).click();
    });
  }
  if (!eventMappers.has(key)) {
    $(document).on("click touchend", `#${id[key]}`, (evt) => {
      clickHandler(key, evt);
    });
    eventMappers.add(key);
  }
  return `
    <div class="price-filter  ${additionalClasses}">
        <div class="ut-toggle-cell-view">
           <span class="ut-toggle-cell-view--label">${label} <br/><small>${info}</small></span>
             <div id='${id[key]}' class="ut-toggle-control">
               <div class="ut-toggle-control--track">
              </div>
              <div class= "ut-toggle-control--grip" >
          </div> 
           </div> 
       </div>
    </div> `;
};
