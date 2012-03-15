(function(window) {
  var Backbone = window.Backbone,
    _ = window._,
    $ = window.$,
    file_upload = {
      Views: {}
    };

  file_upload.Model = Backbone.Model.extend({});
  file_upload.Collection = Backbone.Collection.extend({
    model: file_upload.Model
  });

  file_upload.Views.File = Backbone.View.extend({
    initialize: function(options) {
      _.bindAll(this, 'error', 'sending', 'success');
      options = options || {};
      this.url = options.url || '/upload';
      this.data = options.data || {};
      return this;
    },
    events: {
      'change': 'change'
    },
    change: function(ev) {
      $.ajax(this.url, {
        files: this.$el,
        iframe: true,
        dataType: 'json',
        data: this.data
      }).always(this.sending)
        .success(this.success)
        .error(this.error)
        .done(this.done);
    },
    success: function(data) {
      console.log('success', data);
      this.collection.add(data);
      this.trigger('success', this.collection);
    },
    error: function(data) {
      console.log('error', data);
    },
    sending: function() {
      console.log('sending');
      this.trigger('sending');
    },
    done: function() {
      console.log('done');
      //this.$el.val('');
    }
  });

  Backbone.FileUpload = file_upload;
})(this);
