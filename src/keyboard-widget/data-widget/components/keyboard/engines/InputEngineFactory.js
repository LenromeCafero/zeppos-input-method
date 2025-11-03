import { InputBoxType } from '../../../enums/InputBoxType.js';
import { NormalInputBox } from '../../inputbox/NormalInputBox.js';
// import { PasswordInputBox } from '../PasswordInputBox.js';

export class InputEngineFactory {
    static createInputBox(type, config) {
        const inputBoxMap = {
            [InputBoxType.NORMAL]: NormalInputBox,
            // [InputBoxType.PASSWORD]: PasswordInputBox,
        };

        const InputBoxClass = inputBoxMap[type];
        if (!InputBoxClass) {
            console.warn(`Unknown input box type: ${type}, using Normal as fallback`);
            return new NormalInputBox(config);
        }

        return new InputBoxClass(config);
    }
}