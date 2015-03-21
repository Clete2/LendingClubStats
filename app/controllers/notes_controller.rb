class NotesController < ApplicationController
  require 'concerns/random_note_data'

  def index
  end

  def retrieve
    data = nil;

    if cookies[:account_number] && cookies[:api_key]
      data = HTTParty.get(
          'https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/detailednotes',
          {:headers => {'Authorization' => cookies[:api_key]}}
      )
    else
      random_note_data = RandomNoteData.new
      data = random_note_data.generate_random_notes(100)
    end
    render json: data
  end
end
