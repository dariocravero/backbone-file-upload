/* Backbone File Upload v0.1
 * Copyright 2012, Darío Cravero (dario@qinnova.com.ar | @dariocravero)
 * jquery-iframe-transport by cmlenz @ http://cmlenz.github.com/jquery-iframe-transport/
 * modified by Darío Cravero to include error checking.
 * This library may be freely distributed under the MIT license.
 */
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
      this._readonly = options.readonly || false;
      return this;
    },
    readonly: function(enabled) {
      if (this._readonly != enabled) {
        this.trigger('readonly', this._readonly = enabled);
      }
      return this;
    }
  });

  file_upload.Views.File = Backbone.View.extend({
    initialize: function(options) {
      _.bindAll(this, 'fail', 'uploading', 'done');
      options = options || {};
      this.url = options.url || '/upload';
      this.data = options.data || {};
      this.collection.on('readonly', this.readonly, this);
      return this;
    },
    events: {
      'change': 'change'
    },
    render: function() {
      this.readonly(this.collection._readonly);
      return this;
    },
    readonly: function(enabled) {
      if (enabled) {
        this.$el.attr('disabled', 'disabled');
        this.trigger('disabled');
      } else {
        this.$el.removeAttr('disabled');
        this.trigger('enabled');
      }
    },
    change: function(ev) {
      if (!this.collection._readonly) {
        $.ajax(this.url, {
          files: this.$el,
          iframe: true,
          dataType: 'json',
          data: this.data
        }).always(this.uploading)
          .done(this.done)
          .fail(this.fail);
      }
    },
    done: function(data, textStatus, jqXHR) {
      this.collection.add(data);
      this.trigger('done', this.collection, data, textStatus, jqXHR);
    },
    fail: function(jqXHR) {
      this.trigger('fail', JSON.parse(jqXHR.responseText), jqXHR);
    },
    uploading: function() {
      this.trigger('uploading');
    }
  });

  Backbone.FileUpload = file_upload;
})(this);
