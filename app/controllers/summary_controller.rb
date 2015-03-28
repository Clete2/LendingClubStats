class SummaryController < ApplicationController
  require 'concerns/random_data'
  require 'concerns/http_handler'

  @@random_data = RandomData.new
  @@http_handler = HTTPHandler.new
  @@retries = 3

  def index
  end

  def retrieve_summary_data
    if cookies[:account_number] && cookies[:api_key]
      summary_data = @@http_handler.http_get_with_retries('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/summary',
                                                          {:headers => {'Authorization' => cookies[:api_key]}}, @@retries)

    else
      summary_data = @@random_data.generate_random_account_data
    end
    render json: summary_data
  end

  def retrieve_portfolio_data
    if cookies[:account_number] && cookies[:api_key]
      portfolio_data = @@http_handler.http_get_with_retries('https://api.lendingclub.com/api/investor/v1/accounts/'+ cookies[:account_number] +'/portfolios',
                                                            {:headers => {'Authorization' => cookies[:api_key]}}, @@retries)
    else
      portfolio_data = @@random_data.generate_random_portfolio_data(rand(1..10))
    end
    render json: portfolio_data
  end
end
