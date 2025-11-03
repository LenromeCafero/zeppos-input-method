import { startEnglishInput, getInputMethod } from './main.js';

DataWidget({
  state: {
    text: 'Hello Zepp OS',
  },
  onInit() {
    console.log('onInit')
  },
  build() {
    console.log('build')
    console.log(this.state.text)

    startEnglishInput();
    
  },
})