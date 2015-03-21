class SummaryController < ApplicationController
  require 'concerns/random_data'

  def index
    @data = retrieve()

    render 'index'
  end

  private
  def retrieve
    data = nil;

    if cookies[:account_number] && cookies[:api_key]
      data = HTTParty.get('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/summary',
                          {:headers => {'Authorization' => cookies[:api_key]}})
    else
      random_data = RandomData.new
      data = random_data.generate_random_account_data
    end
  end
end
