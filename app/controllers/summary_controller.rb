class SummaryController < ApplicationController
  require 'concerns/random_data'

  def index
  end

  def retrieve_summary_data
    if cookies[:account_number] && cookies[:api_key]
      summary_data = HTTParty.get('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/summary',
                                  {:headers => {'Authorization' => cookies[:api_key]}})

    else
      random_data = RandomData.new
      summary_data = random_data.generate_random_account_data
    end
    render json: summary_data
  end

  def retrieve_portfolio_data
    if cookies[:account_number] && cookies[:api_key]
      portfolio_data = HTTParty.get('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/portfolios',
                                    {:headers => {'Authorization' => cookies[:api_key]}})
    else
      # TODO: Random portfolio data
    end
    render json: portfolio_data
  end
end
