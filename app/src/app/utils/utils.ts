import { FormGroup } from '@angular/forms';

import { trigger, style, animate, transition, keyframes } from '@angular/animations';
import { API } from '../api/api-endpoint';

export const opacityEnterLeaveTrigger = trigger('opacityEnterLeaveTrigger', [
  transition(':enter', [
     style({ opacity: 0 }),
     animate('1s ease',  keyframes([
        style({ opacity: 0, offset: 0 }),
        style({ opacity: 0.8,  offset: 1 })
     ])),
  ]),
  transition(':leave', [
     animate('1s ease',  keyframes([
        style({ opacity: 0.8, offset: 0 }),
        style({ opacity: 0,  offset: 1 })
     ]))
  ])
]);

export const heightEnterLeaveTrigger = trigger('heightEnterLeaveTrigger', [
  transition(':enter', [
     style({ height: 0}),
     animate('1s ease',  keyframes([
        style({ height: 0 }),
        style({ height: 100 })
     ])),
  ]),
  transition(':leave', [
     animate('1s ease',  keyframes([
        style({ height: 100 }),
        style({ height: 0 })
     ]))
  ])
]);

export const toggleDisabledInputsAndSelect = (idElement: string) => {
  propertiesInputAngularInvalid('Util - toggleDisabledInputsAndSelect', idElement);
  const element = document.getElementById(idElement);
  const inputs = element.getElementsByTagName('INPUT');
  const selects = element.getElementsByTagName('SELECT');
  const changeDisable = (el: Element) => el['disabled'] = !el['disabled'];
  for (var i = 0; i < inputs.length; i++) changeDisable(inputs[i]);
  for (var i = 0; i < selects.length; i++) changeDisable(selects[i]);
}

export const hasPropertyWithValueNullOrEmpty = (object: Object, ...props: string[]): boolean => {
  let result = false;
  const id = object['_id'];
  props.forEach(prop => {
    if (!result) {
      if (object.hasOwnProperty(prop)) {
        const value = object[prop];
        delete object['_id'];
        if (!value) result = true;
        else if (Array.isArray(value)){
          value.forEach(obj => delete obj['_id']);
          if (!value["length"]) result = true;
        }

      }
    }
  });
  object['_id'] = id;
  return result;
}

export const builderObject = (object: Object, properties: string[]) => {
  const invalid = hasPropertyWithValueNullOrEmpty(object, ...properties);
  const message = `Builder Object : the reported object contains properties with invalid values`;
  if (invalid) throw new Error(message);
  return properties.reduce((newObject, prop) => {
    newObject[prop] = object[prop];
    return newObject;
  }, {});
}

export const fbGetValue = (form: FormGroup, key: string) => form.get(key).value;
export const fbSetValue = (form: FormGroup, key: string, value: any) => form.get(key).setValue(value);

export const propertiesInputAngularInvalid = (nameComponent: string, ...props: any[]) => {
  props.map(prop => {
    if (!prop){
      throw new Error(nameComponent + " : there are properties that need to be passed on");
    }
  })
}
