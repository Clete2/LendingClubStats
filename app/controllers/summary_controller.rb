class SummaryController < ApplicationController
  require 'concerns/random_data'

  @@random_data = RandomData.new

  def index
  end

  def retrieve_summary_data
    if cookies[:account_number] && cookies[:api_key]
      summary_data = HTTParty.get('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/summary',
                                  {:headers => {'Authorization' => cookies[:api_key]}})

    else
      summary_data = @@random_data.generate_random_account_data
    end
    render json: summary_data
  end

  def retrieve_portfolio_data
    if cookies[:account_number] && cookies[:api_key]
      portfolio_data = HTTParty.get('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/portfolios',
                                    {:headers => {'Authorization' => cookies[:api_key]}})
    else
      portfolio_data = @@random_data.generate_random_portfolio_data(rand(1..10))
    end
    render json: portfolio_data
  end
end
