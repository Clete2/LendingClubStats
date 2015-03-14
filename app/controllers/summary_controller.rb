class SummaryController < ApplicationController
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
      # Give the user some mocked data.
      data = {
          'mockedData' => true,
          'accountTotal' => 1050,
          'accruedInterest' => 12.20,
          'availableCash' => 50,
          'infundingBalance' => 25,
          'outstandingPrincipal' => 976.08,
          'receivedInterest' => 124.98,
          'receivedLateFees' => 1.20,
          'receivedPrincipal' => 573.71,
          'totalNotes' => 67,
          'totalPortfolios' => 4
      }
    end
  end
end
