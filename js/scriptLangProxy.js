// The purpose of this component is to generate a <script> tag to pull in the correct language version of a component
// The "src" attribute specifies the component to use. The language is detected automatically using "lang" attribute on
// the html tab, or the FS.simpleLocale if the lang attribute is not found.
(function() {
  const supportsShadowDom = !!(/\{\s+\[native code\]\s+\}/).test((HTMLElement.prototype.attachShadow || '').toString());

  /*
   * Language Proxy component
   */
  class ScriptLangProxy extends HTMLElement {
    constructor() {
      super();
      this._rendered = false;
    }

    connectedCallback() {
      if (!this._rendered) {
        this._rendered = true;
        this._root = this;

        // Generate the script tag with the current locale
        var src = this.getAttribute('src');
        var lang = this._getLang();
        var hash = this._getHash();
        this._createScriptTag(src, lang, hash);

        if (supportsShadowDom) {
          this._root = this.attachShadow({mode: 'open'});
        } else {
        }
      }
    }

    _getLang() {
      var lang = '';

      // Try to get the lang attribute of the html tag to identify the desired locale
      var html = document.querySelector('html');
      if(html) {
        lang = html.lang;
      } else {
        // TODO - use FS.simpleLocale
      }
      return lang;
    }

    _getHash() {
      // TODO - maybe get this information from a manifest file?
      return this.getAttribute('hash');
    }

    _createScriptTag(src, lang, hash) {
      // The "src" attribute identifies the component that needs to be fetched in a specific locale
      if(src) {
        var newPath = src;
        if(lang) {
          if(hash) {
            // Replace with lang and hash
            newPath = src.replace('.js', '-' + lang + '-' + hash + '.js');
          } else {
            // Replace with the lang
            newPath = src.replace('.js', '-' + lang + '.js');
          }
        } else if(hash) {
          // Replace with the hash
          newPath = src.replace('.js', '-' + hash + '.js');
        }

        // Create a script tag and place on the page
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute('src', newPath);

        var head = document.querySelector('head');
        head.appendChild(scriptTag);
      }
    }
  }

  /*
   * Define the custom element
   */
  customElements.define('script-lang-proxy', ScriptLangProxy);
}());
