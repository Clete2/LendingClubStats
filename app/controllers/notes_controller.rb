class NotesController < ApplicationController
  require 'concerns/random_data'
  require 'concerns/http_handler'

  @@http_handler = HTTPHandler.new

  def index
  end

  def retrieve
    if cookies[:account_number] && cookies[:api_key]
      data = @@http_handler.http_get_with_retries(
          'https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/detailednotes',
          {:headers => {'Authorization' => cookies[:api_key]}}, 3)
    else
      random_note_data = RandomData.new
      data = random_note_data.generate_random_notes(100)
    end
    render json: data
  end
end
