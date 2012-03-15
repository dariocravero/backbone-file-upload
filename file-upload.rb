require 'rubygems'
require 'sinatra'

require 'fileutils'
require 'json'

# upload with:
# curl -v -F "data=@/path/to/filename"  http://localhost:4567/

get '/' do
  File.read('public/index.html')
end

post '/upload' do
  # fucks IE. they need json!
  # perhaps we do a browser check? crap! the client has to handle it!
  #content_type :json

  FileUtils.mkdir_p('public/files')
  datafile = params[:file]
  filename = File.join('public/files', datafile[:filename])
  File.open(filename, 'wb') do |file|
    file.write(datafile[:tempfile].read)
  end
  datafile.merge({:url => "/files/#{datafile[:filename]}"}).to_json
end

get '/files' do
  `ls public/files`.split("\n").map do |file|
    {:filename => file, :url => "/files/#{file}"}
  end.to_json
end
