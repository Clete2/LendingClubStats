class NotesController < ApplicationController
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
      # Mock some data
      # TODO: Generate random data for mocked data!
      data = {
          'myNotes' =>
              [
                  {
                      'mockedData' => true,
                      'loanId' => 12353251,
                      'noteId' => 7452342,
                      'orderId' => 31284517,
                      'interestRate' => 12.5,
                      'loanLength' => 36,
                      'loanStatus' => 'Charged Off',
                      'grade' => 'B2',
                      'loanAmount' => 13000,
                      'noteAmount' => 25,
                      'paymentsReceived' => 22.52,
                      'accruedInterest' => 0.12,
                      'issueDate' => '01/01/2013',
                      'orderDate' => '12/27/2012'
                  },
                  {
                      'loanId' => 234234,
                      'noteId' => 23423234,
                      'orderId' => 5236526,
                      'interestRate' => 16.2,
                      'loanLength' => 60,
                      'loanStatus' => 'Current',
                      'grade' => 'D1',
                      'loanAmount' => 22000,
                      'noteAmount' => 50,
                      'accruedInterest' => 0.22,
                      'paymentsReceived' => 12.01,
                      'issueDate' => '03/10/2015',
                      'orderDate' => '03/15/2015'
                  }
              ]
      }
    end
    render json: data
  end
end
