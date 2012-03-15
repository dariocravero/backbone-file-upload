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
  content_type :json

  FileUtils.mkdir_p('files')
  p params.inspect
  datafile = params[:file]
  filename = File.join('files', datafile[:filename])
  File.open(filename, 'wb') do |file|
    file.write(datafile[:tempfile].read)
  end
  datafile.to_json
end
