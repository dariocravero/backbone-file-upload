$(function() {
  var app,
    main_view = Backbone.View.extend({
      initialize: function() {
        this.collection.fetch();
        this.collection.on('readonly', this.readonly, this);
        return this;
      },
      events: {
        'click .toggle-readonly': 'toggle_readonly'
      },
      render: function() {
        this.upload_view = new Backbone.FileUpload.Views.File({
          el: this.$('.file-upload input[type=file]'),
          collection: this.collection
        });
        this.upload_view.on('uploading', this.uploading, this);
        this.upload_view.on('done', this.done, this);
        this.upload_view.on('fail', this.fail, this);
        this.upload_view.on('disabled', this.disable, this);
        this.upload_view.on('enabled', this.enable, this);
        this.upload_view.render();
        this.readonly(this.collection._readonly);

        this.files_view = new list_of_files_view({
          collection: this.collection
        }).render();
        this.files_view.$el.insertBefore(this.$('.log'));
        return this;
      },
      uploading: function() {
        this.$('.file-upload').addClass('disabled');
        this.$('.log').append('<li>Uploading...</li>');
      },
      enable: function() {
        this.$('.file-upload').removeClass('disabled');
      },
      disable: function() {
        this.$('.file-upload').addClass('disabled');
      },
      fail: function(data) {
        console.error(data);
        this.$('.log').append('<li>Error</li>');
      },
      done: function() {
        this.$('.log').append('<li>Success</li>');
        this.$('.file-upload').removeClass('disabled');
      },
      toggle_readonly: function(ev) {
        ev.preventDefault();
        this.collection.readonly(!this.collection._readonly);
      },
      readonly: function(enabled) {
        this.$('.toggle-readonly').text('readonly: ' + enabled);
      }
    }),
    file_view = Backbone.View.extend({
      tagName: 'li',
      template: '<%= readonly ? "" : "<span class=delete>[delete]</span>"%><a href="<%=url%>"><%=filename%></a>',
      serialize: function() {
        return {
          readonly: this._readonly,
          url: this.model.get('url'),
          filename: this.model.get('filename')
        };
      },
      events: {
        'click .delete': '_delete'
      },
      initialize: function(options) {
        options = options || {};
        _.bindAll(this, 'readonly', 'remove');
        this._readonly = options.readonly || false;
        this.model.on('destroy', this.destroy, this);
        return this;
      },
      render: function() {
        this.$el.html(_.template(this.template, this.serialize()));
        return this;
      },
      destroy: function() {
        this.model.off('destroy', this.destroy);
        this.$el.slideUp(this.remove);
      },
      _delete: function() {
        if (!this._readonly) {
          this.model.destroy();
        }
      },
      readonly: function(enabled) {
        if (this._readonly != enabled) {
          this._readonly = enabled;
          this.render();
        }
      }
    }),
    list_of_files_view = Backbone.View.extend({
      tagName: 'ul',
      initialize: function(options) {
        _.bindAll(this, 'add');
        this.collection.on('reset', this.render, this);
        this.collection.on('add', this.add, this);
        this.collection.on('readonly', this.readonly, this);
        this.file_views = [];
        return this;
      },
      render: function() {
        this.collection.each(this.add);
        return this;
      },
      add: function(file) {
        var view = new file_view({model: file, 
                                 readonly: this.collection._readonly}).render();
        this.$el.append(view.el);
        this.file_views.push(view);
      },
      readonly: function(enabled) {
        _.invoke(this.file_views, 'readonly', enabled);
      }
    });

  app = new main_view({
    el: $('#main'),
    collection: new Backbone.FileUpload.Collection(null, {
      url: '/files',
      readonly: false
    })
  }).render();
});
