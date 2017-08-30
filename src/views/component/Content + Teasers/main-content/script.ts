Polymer({
  is: name,
  properties: {
    variation: 0,
    fullbleed: {
      type: Boolean,
      value: true
    }
  },
  attached: function() {
    var self = this;

    $('head').append('<style>html,body { height: 100%; }</style>');

    $('#main-navigation').on('show.bs.collapse hidden.bs.collapse', function(e) {
      $('body').toggleClass('navigation-open');
    })

    window.onload = function() {
      self.setContentHeight.call(self);
    }
    window.onresize = function() {
      self.setContentHeight.call(self);
    }
  },
  setContentHeight: function() {
    var component = this,
        header  = document.querySelector('c-corporate-header') || document.createElement('c-corporate-header'),
        main    = document.querySelector('c-main-content'),
        content = main.querySelector('.content'),
        footer  = document.querySelector('c-corporate-footer') || document.createElement('c-corporate-footer'),
        pageref = window.location.pathname,
        lastPos = CorporateUi.readCookie(pageref) || '0:0',
        headerHeight = header.getBoundingClientRect().height,
        footerHeight = footer.getBoundingClientRect().height;

    $(component).css({
      'padding-top'     : headerHeight,
      'margin-top'      : headerHeight * -1,
      'padding-bottom'  : footerHeight,
      'margin-bottom'   : footerHeight * -1
    });
  }
});