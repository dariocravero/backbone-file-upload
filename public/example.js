$(function() {
  window.collection = new Backbone.FileUpload.Collection(); 
  window.collection.on('add', function(model) {
    $('ul').append('<li>'+model.get('filename')+'</li>');
  });
  window.view = new Backbone.FileUpload.Views.File({
    el: $('#main .file-upload input[type=file]'),
    collection: window.collection
  });
});
