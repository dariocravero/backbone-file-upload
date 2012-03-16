$(function() {
  var app,
    main_view = Backbone.View.extend({
      initialize: function() {
        this.collection.fetch();
        return this;
      },
      render: function() {
        this.upload_view = new Backbone.FileUpload.Views.File({
          el: this.$('.file-upload input[type=file]'),
          collection: this.collection
        });
        this.upload_view.on('uploading', this.uploading, this);
        this.upload_view.on('done', this.done, this);
        this.upload_view.on('fail', this.fail, this);

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
      fail: function(data) {
        console.error(data);
        this.$('.log').append('<li>Error</li>');
      },
      done: function() {
        this.$('.log').append('<li>Success</li>');
      }
    }),
    file_view = Backbone.View.extend({
      tagName: 'li',
      template: '<span class=delete>[delete]</span><a href="<%=url%>"><%=filename%></a>',
      serialize: function() {
        return {
          url: this.model.get('url'),
          filename: this.model.get('filename')
        };
      },
      events: {
        'click .delete': '_delete'
      },
      render: function() {
        this.model.on('destroy', this.destroy, this);
        this.$el.html(_.template(this.template, this.serialize()));
        return this;
      },
      destroy: function() {
        this.model.off('destroy', this.destroy);
        this.$el.slideUp();
      },
      _delete: function() {
        this.model.destroy();
      }
    }),
    list_of_files_view = Backbone.View.extend({
      tagName: 'ul',
      initialize: function(options) {
        _.bindAll(this, 'add');
        this.collection.on('reset', this.render, this);
        this.collection.on('add', this.add, this);
        return this;
      },
      render: function() {
        this.file_views = [];
        this.collection.each(this.add);
        return this;
      },
      add: function(file) {
        var view = new file_view({model: file}).render();
        this.$el.append(view.el);
        this.file_views.push(view);
      }
    });

  app = new main_view({
    el: $('#main'),
    collection: new Backbone.FileUpload.Collection(null, {
      url: '/files'
    })
  }).render();
});
