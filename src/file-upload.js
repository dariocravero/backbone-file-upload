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
      return this;
    }
  });

  file_upload.Views.FileInput = Backbone.View.extend({
    initialize: function(options) {
      _.bindAll(this, 'fail', 'uploading', 'done');
      options = options || {};
      this.url = options.url || '/upload';
      this.data = options.data || {};
      this._name = options.name || 'files[]';
      this._multiple = options.multiple || true;
      this._enabled = options.enabled || true;
      return this;
    },
    tagName: 'input',
    events: {
      'change': 'change'
    },
    render: function() {
      this.$el.attr('type', 'file').attr('name', this._name);
      if (this._multiple) {
        this.$el.attr('multiple', true);
      }
      if (!this._enabled) {
        this.$el.attr('disabled', 'disabled');
      }
      this.$input = this.$el;
      return this;
    },
    enable: function(enable) {
      if (this._enabled != enable) {
        this._enabled = enable;
        if (enable) {
          this.$input.removeAttr('disabled');
        } else {
          this.$input.attr('disabled', 'disabled');
        }
        this.trigger('enabled', enable);
      }
    },
    toggle_enable: function() {
      this.enable(!this._enabled);
    },
    change: function(ev) {
      if (this._enabled) {
        $.ajax(this.url, {
          files: this.$input,
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
    uploading: function(data, textStatus, jqXHR) {
      this.trigger('uploading');
      this.$input.val('');
    }
  });

  file_upload.Views.LabelFileInput = file_upload.Views.FileInput.extend({
    template: '<%=text%><input type=file name=<%=name%> <%= enabled ? "" : "disabled=disabled" %> <%= multiple ? "multiple" : ""%> />',
    initialize: function(options) {
      options = options || {};
      this._text = options.text || 'Upload File';
      this.template = options.template || _.template(this.template);
      return file_upload.Views.FileInput.prototype.initialize.call(this, options);
    },
    tagName: 'label',
    className: 'file-upload',
    events: {
      'change input[type=file]': 'change'
    },
    serialize: function() {
      return {text: this._text,
        name: this._name,
        multiple: this._multiple,
        enabled: this._enabled};
    },
    render: function() {
      this.$el.html(this.template(this.serialize()));
      this.$input = this.$('input[type=file]');
      if (!this._enabled) {
        this.$el.addClass('disabled');
      }
      return this;
    },
    enable: function(enable) {
      if (this._enabled != enable) {
        this.$el[enable ? 'removeClass' : 'addClass']('disabled');
        return file_upload.Views.FileInput.prototype.enable.call(this, enable);
      }
    }
  });

  Backbone.FileUpload = file_upload;
})(this);
