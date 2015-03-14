class NotesController < ApplicationController
  def index
  end

  def retrieve
    @response = HTTParty.get(
        'https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/detailednotes',
        {:headers => {'Authorization' => cookies[:api_key]}}
    )

    render json: @response
  end
end
