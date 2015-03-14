class SummaryController < ApplicationController
  def index
    @data = retrieve()

    render 'index'
  end

  private
  def retrieve
    return HTTParty.get('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/summary',
                        {:headers => {'Authorization' => cookies[:api_key]}})
  end
end
