$(function() {
  window.collection = new Backbone.FileUpload.Collection({
    url: '/files'
  }); 
  function add(model) {
    $('ul').append('<li><a href="'+model.get('url')+'">'+model.get('filename')+'</a></li>');
  }
  window.collection.on('add', add);
  window.collection.on('reset', function(collection) {
    collection.each(add);
  });
  window.collection.fetch();
  window.view = new Backbone.FileUpload.Views.File({
    el: $('#main .file-upload input[type=file]'),
    collection: window.collection
  });
});
