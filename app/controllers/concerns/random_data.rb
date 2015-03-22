class RandomData
  @@note_amounts = [25, 50]
  @@loan_statuses_weighted = ['In Review', 'In Funding', 'Issuing', 'Issued',
                              'Issued', 'Current', 'Current', 'Current', 'Current',
                              'Current', 'Current', 'Current', 'Current',
                              'Current', 'Current', 'In Grace Period', 'Late (16-30)',
                              'Late (31-120)', 'Fully Paid', 'Fully Paid',
                              'Fully Paid', 'Default', 'Charged Off']
  @@loan_lengths = [36, 60]
  @@grades = %w(A1 A2 A3 A4 A5 B1 B2 B3 B4 B5 C1 C2 C3 C4
             C5 D1 D2 D3 D4 D5 E1 E2 E3 E4 E5 F1 F2 F3 F4 F5 G1 G2 G3 G4 G5)
  @@credit_trends = %w(UP FLAT DOWN)

  def generate_random_account_data
    {
        'mockedData' => true,
        'accountTotal' => ('%.2f' % rand(250.00..15000.00)).to_f,
        'accruedInterest' => ('%.2f' % rand(0.00..40.00)).to_f,
        'availableCash' => ('%.2f' % rand(0.00..1000.00)).to_f,
        'infundingBalance' => ('%.2f' % rand(0.00..1000.00)).to_f,
        'outstandingPrincipal' => ('%.2f' % rand(0.00..15000.00)).to_f,
        'receivedInterest' => ('%.2f' % rand(0.00..3000.00)).to_f,
        'receivedLateFees' => ('%.2f' % rand(0.00..20.00)).to_f,
        'receivedPrincipal' => ('%.2f' % rand(0.00..10000.00)).to_f,
        'totalNotes' => rand(0..600),
        'totalPortfolios' => rand(0..10)
    }
  end

  def generate_random_notes(count)
    notes_list = []

    (0..count).each {
      note_amount = @@note_amounts.sample
      loan_length = @@loan_lengths.sample
      loan_status = @@loan_statuses_weighted.sample
      if ['Charged Off', 'Default'].include? loan_status
        payments_received = '%.2f' % rand(1.00..(note_amount * 0.8))
      else
        payments_received = '%.2f' % rand(1.00..(note_amount * 1.2))
      end


      note = {
          'loanId' => rand(10000000..99999999),
          'noteId' => rand(10000000..99999999),
          'orderId' => rand(10000000..99999999),
          'interestRate' => ('%.1f' % rand(5.0..22.0)).to_f,
          'loanLength' => loan_length,
          'loanStatus' => loan_status,
          'grade' => @@grades.sample,
          'loanAmount' => rand(1000..35000),
          'noteAmount' => note_amount,
          'paymentsReceived' => payments_received.to_f,
          'accruedInterest' => ('%.2f' % rand(0.00..0.50)).to_f,
          'issueDate' => rand(loan_length.months.ago..Time.now).strftime('%m/%d/%Y'),
          'orderDate' => rand(loan_length.months.ago..Time.now).strftime('%m/%d/%Y'),
          'nextPaymentDate' => rand(Time.now..1.month.from_now).strftime('%m/%d/%Y'),
          'creditTrend' => @@credit_trends.sample
      }

      notes_list.push(note)
    }

    # TODO: Maybe move this out of the loan
    notes_list[0]['mockedData'] = true

    data = {'myNotes' => notes_list}
  end

  def generate_random_portfolio_data(count)
    portfolios_list = []

    (0..count).each {
      portfolio = {
          'portfolioId' => rand(100000..999999),
          'portfolioName' => 'Sample Portfolio',
          'portfolioDescription' => 'Sample Description'
      }

      portfolios_list.push(portfolio)
    }

    data = {'myPortfolios' => portfolios_list}
  end
end