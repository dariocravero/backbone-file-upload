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
  # uncomment the following line if you want it to stop working with IE :)
  # content_type :json

  p "POST /upload"
  p params[:files].inspect

  #return error 404

  FileUtils.mkdir_p('public/files')
  files = params[:files] || []
  files.map do |datafile|
    p "-> Writing file #{datafile[:filename]}"
    filename = File.join('public/files', datafile[:filename])
    File.open(filename, 'wb') do |file|
      file.write(datafile[:tempfile].read)
    end
    p "-> Written."
    datafile.merge({:url => "/files/#{datafile[:filename]}", :id => datafile[:filename]})
  end.to_json
end

get '/files' do
  content_type :json
  p "GET /files"

  `ls public/files`.split("\n").map do |file|
    {:filename => file, :url => "/files/#{file}", :id => file}
  end.to_json
end

delete '/files/:filename' do
  content_type :json
  p "DELETE\t#{params[:filename]}"

  file = "public/files/#{params[:filename]}"
  error 404 if !File.exists?(file)
  FileUtils.rm file
  p "-> Deleted."
  {:filename => params[:filename], :deleted => true}.to_json
end
