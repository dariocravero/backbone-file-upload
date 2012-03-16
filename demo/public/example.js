$(function() {
  var app,
    main_view = Backbone.View.extend({
      initialize: function() {
        this.collection.fetch();
        return this;
      },
      events: {
        'click .toggle-readonly': 'toggle_readonly'
      },
      render: function() {
        this.upload_view = new Backbone.FileUpload.Views.LabelFileInput({
          collection: this.collection,
          text: '&#8853; Upload!'
        });
        this.upload_view.on('uploading', this.uploading, this);
        this.upload_view.on('done', this.done, this);
        this.upload_view.on('fail', this.fail, this);
        this.upload_view.on('enabled', this.enable, this);
        this.upload_view.render();
        this.upload_view.$el.insertAfter(this.$('.toggle-readonly'));

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
      enable: function(enabled) {
        this.$('.file-upload')[enabled ? 'removeClass' : 'addClass']('disabled');
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
        this.upload_view.toggle_enable();
        this.files_view.toggle_readonly();
        this.$('.toggle-readonly').text('readonly: ' + this.files_view._readonly);
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
        options = options || {};
        _.bindAll(this, 'add');
        this.collection.on('reset', this.render, this);
        this.collection.on('add', this.add, this);
        this.file_views = [];
        this._readonly = options.readonly || false;
        return this;
      },
      render: function() {
        this.collection.each(this.add);
        return this;
      },
      add: function(file) {
        var view = new file_view({model: file, 
                                 readonly: this._readonly}).render();
        this.$el.append(view.el);
        this.file_views.push(view);
      },
      readonly: function(enabled) {
        if (this._readonly != enabled) {
          this._readonly = enabled;
          _.invoke(this.file_views, 'readonly', enabled);
        }
      },
      toggle_readonly: function() {
        this.readonly(!this._readonly);
      }
    });

  app = new main_view({
    el: $('#main'),
    collection: new Backbone.FileUpload.Collection(null, {
      url: '/files'
    })
  }).render();
});
