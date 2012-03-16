(function(window) {
  var Backbone = window.Backbone,
    _ = window._,
    $ = window.$,
    file_upload = {
      Views: {}
    };

  file_upload.Model = Backbone.Model.extend({});
  file_upload.Collection = Backbone.Collection.extend({
    model: file_upload.Model,
    initialize: function(options) {
      options = options || {}
      this.url = options.url || '/files';
      return this;
    }
  });

  file_upload.Views.File = Backbone.View.extend({
    initialize: function(options) {
      _.bindAll(this, 'fail', 'uploading', 'done');
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
      }).always(this.uploading)
        .done(this.done)
        .fail(this.fail);
    },
    done: function(data) {
      this.collection.add(data);
      this.trigger('done', this.collection);
    },
    fail: function(data) {
      this.trigger('fail', data);
    },
    uploading: function() {
      this.trigger('uploading');
    }
  });

  Backbone.FileUpload = file_upload;
})(this);
