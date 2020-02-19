import {
  Component, h, Prop, State, Host, Element, Watch
} from '@stencil/core';

import BsModal from 'bootstrap/js/src/modal';

@Component({
  tag: 'c-modal',
  styleUrl: 'modal.scss',
  shadow: true,
})
export class Modal {
  @Prop({ context: 'store' }) ContextStore: any;

  /** Per default, this will inherit the value from c-theme name property */
  @Prop({ mutable: true }) theme: string;

  @Prop() config;

  @Prop() event;

  @Prop() open: boolean;

  @Prop() close: boolean = true;

  @State() store: any;

  @State() tagName: string;

  @State() currentTheme = { components: [] };

  @State() items: Array<any> = [];

  @State() modal;

  @State() dialog;

  @State() setScrollbar;

  @State() all = false;

  @Element() el;

  @Watch('theme')
  setTheme(name = undefined) {
    this.theme = name || this.store.getState().theme.current;
    this.currentTheme = this.store.getState().theme.items[this.theme];
  }

  @Watch('open')
  openDialog(state) {
    if(state) {
      this.modal.show(this.dialog);
    } else {
      this.modal.hide();
    }

    // We need to manually do this here because of no access to 'transitionComplete()'
    this.modal._isTransitioning = false;
  }

  @Watch('config')
  configureModal(config) {
    this.modal = new BsModal(this.el, config);

    this.setScrollbar = this.setScrollbar || this.modal._setScrollbar;

    // We should not set this based on config.backdrop but instead use inline value
    this.modal._setScrollbar = this.config.backdrop ? this.setScrollbar : () => {};
    // this.modal._setScrollbar = this.el.classList.contains('inline') ? () => {} : this.setScrollbar;
  }

  appendStyle(state) {
    if(state !== false) return;

    /*FIXME: Temp solution for IOS Safari modal height https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
     First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    Then we set the value in the --vh custom property to the root of the document
    */
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    const css = `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1040;
        width: 100vw;
        height: 100vh;
        background-color: #000;
      }
      .modal-backdrop.fade { opacity: 0; }
      .modal-backdrop.show { opacity: 0.5; }`;
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
  }

  componentWillLoad() {
    this.store = this.ContextStore || (window as any).CorporateUi.store;

    this.setTheme(this.theme);

    this.store.subscribe(() => this.setTheme());

    if (!(this.el && this.el.nodeName)) return;

    this.tagName = this.el.nodeName.toLowerCase();

    this.configureModal(this.config);

    this.appendStyle(this.store.getState().theme.global);
  }

  componentDidLoad() {
    this.openDialog(this.open);
  }

  render() {
    return (
      <Host class="fade" tabindex="-1" role="dialog" aria-modal="true">
        { this.currentTheme ? <style>{ this.currentTheme.components[this.tagName] }</style> : '' }

        <div class="modal-dialog modal-dialog-centered" role="document" ref={el => this.dialog = el}>
          <div class="modal-content">
            <div class="modal-header">
              <slot name="header" />
              { this.close ?
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              : '' }
            </div>
            <div class="modal-body">
              <slot />
            </div>
            <div class="modal-footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </Host>
    )
  }
}