import { Modal } from '@blockly/plugin-modal';
import * as Blockly from "blockly/core";
import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
// import { Dialog } from '@headlessui/vue';
import Button from 'primevue/button';
import App from './modal.vue'
import initUnocssRuntime from '@unocss/runtime'

initUnocssRuntime({ /* options */ })

export class TypedVariablesToolbox extends Modal {
  #app;
  workspace_;
  /**
   * Constructor for ...
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the plugin will
   *     be added to.
   */
  constructor(workspace, btnCallBackName_) {
    /**
     * The workspace.
     * @type {!Blockly.WorkspaceSvg}
     * @protected
     */
    super("TOOLBOX", workspace);
    this.workspace_ = workspace;
    this.btnCallBackName_ = btnCallBackName_;
  }

  /**
   * Initialize.
   */
  init() {
    super.init();
    // this.render();

    this.workspace_.registerButtonCallback(this.btnCallBackName_, () => {
      this.show()
    });
  }

  show() {
    console.log(Blockly.WidgetDiv.getDiv());
    if (Blockly.WidgetDiv.isVisible()) {
      Blockly.WidgetDiv.hide()
    } else {
      Blockly.WidgetDiv.createDom();
      Blockly.WidgetDiv.show(
        this,
        this.workspace_.RTL,
        () => this.widgetDispose_(),
        this.workspace_
      );
      this.widgetCreate_();
    }
    console.log(this.#app)
    this.#app._instance.data.open = !this.#app._instance.data.open
  }

  widgetCreate_() {
    const widgetDiv = Blockly.WidgetDiv.getDiv();
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blocklyModalOpen');
    widgetDiv.appendChild(this.htmlDiv_);
  }

  /**
   * Disposes of any events or dom-references belonging to the editor.
   * @protected
   */
  widgetDispose_() {
    Blockly.utils.dom.removeClass(this.htmlDiv_, 'blocklyModalOpen');
  }

  render() {
    this.htmlDiv_ = document.createElement('div');
    this.htmlDiv_.className = 'blocklyModalOverlay';

    console.log('something is not amiss yet')

    const app = this.#app = createApp(App, {
      creator: (ct) => {
        this.workspace_.createVariable(ct.name, ct.type)
        console.log("i have captured yayy", ct)
      },
      toggler: this.show
    });

    app.use(PrimeVue, { unstyled: true });
    app.component('Dialog', Dialog)
    app.component('Button', Button)
    app.component('Select', Select)

    this.#app.mount(this.htmlDiv_)

    console.log('something is amiss')
    console.log(this.#app)
  }
}
